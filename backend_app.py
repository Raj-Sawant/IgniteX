import io
import os
import cv2
import numpy as np
import torch
import albumentations as A
from albumentations.pytorch import ToTensorV2

from fastapi import FastAPI, File, UploadFile
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import segmentation_models_pytorch as smp

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
IMG_SIZE = 512

CLASS_INFO = {
    100:   ('Trees',          '#2d6a4f'),
    200:   ('Lush Bushes',    '#52b788'),
    300:   ('Dry Grass',      '#d4a373'),
    500:   ('Dry Bushes',     '#a98467'),
    550:   ('Ground Clutter', '#6b4226'),
    600:   ('Flowers',        '#f72585'),
    700:   ('Logs',           '#4a1942'),
    800:   ('Rocks',          '#7b7b7b'),
    7100:  ('Landscape',      '#e9c46a'),
    10000: ('Sky',            '#48cae4'),
}
MASK_VALS = sorted(CLASS_INFO.keys())
NUM_CLASSES = len(MASK_VALS)

val_transform = A.Compose([
    A.Resize(IMG_SIZE, IMG_SIZE),
    A.Normalize(mean=(0.485,0.456,0.406), std=(0.229,0.224,0.225)),
    ToTensorV2(),
])

def idx_mask_to_color(mask_idx):
    colors = []
    for v in MASK_VALS:
        hex_str = CLASS_INFO[v][1]
        rgb = tuple(int(hex_str[i:i+2], 16) for i in (1,3,5))
        colors.append(rgb)
    color = np.zeros((*mask_idx.shape, 3), dtype=np.uint8)
    for c_idx, rgb in enumerate(colors):
        color[mask_idx == c_idx] = rgb
    return color

model = smp.DeepLabV3Plus(
    encoder_name='resnet50',
    encoder_weights=None,
    in_channels=3,
    classes=NUM_CLASSES,
    activation=None,
).to(DEVICE)

MODEL_PATH = "checkpoints/best_model.pth"

if os.path.exists(MODEL_PATH):
    print("Loading weights from", MODEL_PATH)
    ckpt = torch.load(MODEL_PATH, map_location=DEVICE)
    if 'model_state_dict' in ckpt:
        model.load_state_dict(ckpt['model_state_dict'])    
    else:
        model.load_state_dict(ckpt)
else:
    print(f"Warning: {MODEL_PATH} not found. Running with random weights.")

model.eval()

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_rgb = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img_rgb, cv2.COLOR_BGR2RGB)
    
    aug = val_transform(image=img_rgb)
    inp = aug['image'].unsqueeze(0).to(DEVICE)
    
    with torch.no_grad():
        pred_idx = model(inp).argmax(1).squeeze().cpu().numpy()
        
    color_out = idx_mask_to_color(pred_idx)
    
    is_success, buffer = cv2.imencode(".png", cv2.cvtColor(color_out, cv2.COLOR_RGB2BGR))
    io_buf = io.BytesIO(buffer)
    
    return Response(content=io_buf.getvalue(), media_type="image/png")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
