!pip install segmentation-models-pytorch -q
!pip install albumentations -q
print('✅ Dependencies installed')
# -----
import os

# ── Kaggle dataset root ──────────────────────────────────────────────────────
BASE = '/kaggle/input/datasets/atharvashinde9594/offroad-seg/Dataset'

TRAIN_IMG_DIR  = os.path.join(BASE, 'Offroad_Segmentation_Training_Dataset/train/Color_Images')
TRAIN_MASK_DIR = os.path.join(BASE, 'Offroad_Segmentation_Training_Dataset/train/Segmentation')
VAL_IMG_DIR    = os.path.join(BASE, 'Offroad_Segmentation_Training_Dataset/val/Color_Images')
VAL_MASK_DIR   = os.path.join(BASE, 'Offroad_Segmentation_Training_Dataset/val/Segmentation')
TEST_IMG_DIR   = os.path.join(BASE, 'Offroad_Segmentation_testImages/Color_Images')

# Verify all paths exist
for name, path in [
    ('Train images',  TRAIN_IMG_DIR),
    ('Train masks',   TRAIN_MASK_DIR),
    ('Val images',    VAL_IMG_DIR),
    ('Val masks',     VAL_MASK_DIR),
    ('Test images',   TEST_IMG_DIR),
]:
    exists = os.path.isdir(path)
    count  = len(os.listdir(path)) if exists else 0
    status = '✅' if exists else '❌ NOT FOUND'
    print(f'{status}  {name:<15}: {path}  ({count} files)')
# -----
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from collections import defaultdict

# ── Class definitions (from PS1 / challenge spec) ────────────────────────────
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

MASK_VALS   = sorted(CLASS_INFO.keys())            # [100,200,300,500,550,600,700,800,7100,10000]
VAL_TO_IDX  = {v: i for i, v in enumerate(MASK_VALS)}
IDX_TO_VAL  = {i: v for v, i in VAL_TO_IDX.items()}
CLASS_NAMES = [CLASS_INFO[v][0] for v in MASK_VALS]
NUM_CLASSES = len(MASK_VALS)   # 10

print(f'Classes ({NUM_CLASSES} total):')
for i, v in enumerate(MASK_VALS):
    print(f'  idx {i:2d}  mask_val={v:5d}  {CLASS_INFO[v][0]}')
# -----
# ── Visualize a sample image + mask ─────────────────────────────────────────
def mask_to_color(mask_np_raw):
    """Convert raw mask pixel values → RGB using CLASS_INFO colors."""
    if mask_np_raw.ndim == 3:
        mask_np_raw = mask_np_raw[:, :, 0]
    color = np.zeros((*mask_np_raw.shape, 3), dtype=np.uint8)
    for val, (_, hex_c) in CLASS_INFO.items():
        rgb = tuple(int(hex_c[i:i+2], 16) for i in (1, 3, 5))
        color[mask_np_raw == val] = rgb
    return color

def idx_mask_to_color(mask_idx):
    """Convert class-index mask → RGB."""
    colors = [tuple(int(CLASS_INFO[v][1][i:i+2], 16) for i in (1,3,5)) for v in MASK_VALS]
    color = np.zeros((*mask_idx.shape, 3), dtype=np.uint8)
    for c_idx, rgb in enumerate(colors):
        color[mask_idx == c_idx] = rgb
    return color

sample_name = sorted(os.listdir(TRAIN_IMG_DIR))[10]
img_raw  = np.array(Image.open(os.path.join(TRAIN_IMG_DIR,  sample_name)).convert('RGB'))
mask_raw = np.array(Image.open(os.path.join(TRAIN_MASK_DIR, sample_name)))

fig, axes = plt.subplots(1, 3, figsize=(16, 5))
axes[0].imshow(img_raw);             axes[0].set_title(f'RGB Image\n{sample_name}', fontsize=12)
axes[1].imshow(mask_raw[:,:,0] if mask_raw.ndim==3 else mask_raw, cmap='nipy_spectral')
axes[1].set_title('Raw Mask (pixel values)', fontsize=12)
axes[2].imshow(mask_to_color(mask_raw)); axes[2].set_title('Colorized Mask', fontsize=12)
for ax in axes: ax.axis('off')
patches = [mpatches.Patch(color=hx, label=f'{nm}') for (nm,hx) in CLASS_INFO.values()]
fig.legend(handles=patches, loc='lower center', ncol=5, fontsize=9, bbox_to_anchor=(0.5,-0.05))
plt.tight_layout()
plt.savefig('/kaggle/working/sample_visualization.png', dpi=120, bbox_inches='tight')
plt.show()

# ── Class frequency from 100 training masks ──────────────────────────────────
counts = defaultdict(int)
for fn in sorted(os.listdir(TRAIN_MASK_DIR))[:100]:
    m = np.array(Image.open(os.path.join(TRAIN_MASK_DIR, fn)))
    if m.ndim == 3: m = m[:, :, 0]
    for v in MASK_VALS:
        counts[v] += int((m == v).sum())

total = sum(counts.values()) or 1
print('\nClass distribution (100 training images):')
for v in MASK_VALS:
    pct = 100 * counts[v] / total
    bar = '█' * max(1, int(pct / 2))
    print(f'  {CLASS_INFO[v][0]:15s}: {pct:5.1f}%  {bar}')
# -----
import cv2
import torch
from torch.utils.data import Dataset, DataLoader
import albumentations as A
from albumentations.pytorch import ToTensorV2

IMG_SIZE   = 512    # ⬆ was 256 — higher res = better terrain detail
BATCH_SIZE = 8      # reduce to 4 if GPU runs out of memory

# ── Augmentation pipelines ───────────────────────────────────────────────────
train_transform = A.Compose([
    A.Resize(IMG_SIZE, IMG_SIZE),
    A.HorizontalFlip(p=0.5),
    A.VerticalFlip(p=0.2),
    A.RandomRotate90(p=0.3),
    A.Affine(translate_percent=0.05, scale=(0.9, 1.1), rotate=(-15, 15), p=0.5),
    A.RandomCrop(height=int(IMG_SIZE*0.9), width=int(IMG_SIZE*0.9), p=0.3),
    A.Resize(IMG_SIZE, IMG_SIZE),
    A.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3, hue=0.1, p=0.6),
    A.GaussianBlur(blur_limit=3, p=0.2),
    A.GaussNoise(p=0.2),
    A.Normalize(mean=(0.485,0.456,0.406), std=(0.229,0.224,0.225)),
    ToTensorV2(),
])

val_transform = A.Compose([
    A.Resize(IMG_SIZE, IMG_SIZE),
    A.Normalize(mean=(0.485,0.456,0.406), std=(0.229,0.224,0.225)),
    ToTensorV2(),
])

# ── Dataset class ────────────────────────────────────────────────────────────
class OffroadDataset(Dataset):
    def __init__(self, img_dir, mask_dir, transform=None):
        self.img_dir   = img_dir
        self.mask_dir  = mask_dir
        self.transform = transform
        self.filenames = sorted(os.listdir(img_dir))

    def __len__(self):
        return len(self.filenames)

    def __getitem__(self, idx):
        fname = self.filenames[idx]
        image = cv2.imread(os.path.join(self.img_dir, fname))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        mask = np.array(Image.open(os.path.join(self.mask_dir, fname)))
        if mask.ndim == 3:
            mask = mask[:, :, 0]    # take first channel if RGB mask

        # Map raw pixel values (100,200,...,10000) → class indices (0–9)
        mapped = np.zeros_like(mask, dtype=np.int64)
        for val, idx_val in VAL_TO_IDX.items():
            mapped[mask == val] = idx_val

        if self.transform:
            aug    = self.transform(image=image, mask=mapped)
            image  = aug['image']                                       # float32 [3,H,W]
            mapped = torch.as_tensor(aug['mask'], dtype=torch.long)     # [H,W]
        else:
            image  = torch.from_numpy(image.transpose(2,0,1)).float() / 255.0
            mapped = torch.from_numpy(mapped)

        return image, mapped

# ── Test dataset (images only, no masks needed) ──────────────────────────────
class TestDataset(Dataset):
    def __init__(self, img_dir, transform=None):
        self.img_dir   = img_dir
        self.transform = transform
        self.filenames = sorted(os.listdir(img_dir))

    def __len__(self):
        return len(self.filenames)

    def __getitem__(self, idx):
        fname = self.filenames[idx]
        image = cv2.imread(os.path.join(self.img_dir, fname))
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        if self.transform:
            aug   = self.transform(image=image, mask=np.zeros(image.shape[:2], dtype=np.int64))
            image = aug['image']
        return image, fname

# ── Build datasets & loaders ─────────────────────────────────────────────────
train_ds = OffroadDataset(TRAIN_IMG_DIR, TRAIN_MASK_DIR, train_transform)
val_ds   = OffroadDataset(VAL_IMG_DIR,   VAL_MASK_DIR,   val_transform)
test_ds  = TestDataset(TEST_IMG_DIR, val_transform)

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,
                          num_workers=2, pin_memory=True, drop_last=True)
val_loader   = DataLoader(val_ds,   batch_size=BATCH_SIZE, shuffle=False,
                          num_workers=2, pin_memory=True)
test_loader  = DataLoader(test_ds,  batch_size=4, shuffle=False, num_workers=2)

print(f'Train : {len(train_ds)} images')
print(f'Val   : {len(val_ds)} images')
print(f'Test  : {len(test_ds)} images')

imgs, masks = next(iter(train_loader))
print(f'\nBatch → images: {imgs.shape}, masks: {masks.shape}')
print(f'Image range   : [{imgs.min():.2f}, {imgs.max():.2f}]')
print(f'Mask classes  : {masks.unique().tolist()}')
# -----
import torch.nn as nn
import segmentation_models_pytorch as smp

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f'Device : {device}')
if device.type == 'cuda':
    print(f'GPU    : {torch.cuda.get_device_name(0)}')
    print(f'VRAM   : {torch.cuda.get_device_properties(0).total_memory/1e9:.1f} GB')

# DeepLabV3+ with ResNet50 pretrained encoder
# encoder_weights='imagenet' → model already knows edges, textures, shapes
model = smp.DeepLabV3Plus(
    encoder_name='resnet50',
    encoder_weights='imagenet',
    in_channels=3,
    classes=NUM_CLASSES,
    activation=None,         # raw logits
).to(device)

total     = sum(p.numel() for p in model.parameters())
trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f'\nTotal params     : {total:,}')
print(f'Trainable params : {trainable:,}')

# Sanity check — use eval() so BatchNorm works with batch_size=1
model.eval()
with torch.no_grad():
    dummy = torch.randn(1, 3, IMG_SIZE, IMG_SIZE).to(device)
    out   = model(dummy)
    print(f'Output shape     : {out.shape}')  # [1, 10, 512, 512]
model.train()  # put back in train mode
# -----
import torch.nn.functional as F

# ── Compute class weights from training masks ─────────────────────────────────
print('Computing class weights...')
class_pixel_counts = np.zeros(NUM_CLASSES, dtype=np.float64)

for fn in sorted(os.listdir(TRAIN_MASK_DIR))[:200]:   # sample 200 for speed
    m = np.array(Image.open(os.path.join(TRAIN_MASK_DIR, fn)))
    if m.ndim == 3: m = m[:, :, 0]
    for val, idx in VAL_TO_IDX.items():
        class_pixel_counts[idx] += (m == val).sum()

total_pix    = class_pixel_counts.sum()
class_freqs  = class_pixel_counts / (total_pix + 1e-9)
# Inverse-frequency weights, clipped to sane range
class_weights = np.clip(1.0 / (class_freqs + 1e-4), 0.5, 20.0)
class_weights /= class_weights.mean()   # normalize so mean ≈ 1

print(f'\n{"Class":<16} {"Frequency":>10}  {"Weight":>8}')
print('-' * 40)
for name, freq, w in zip(CLASS_NAMES, class_freqs, class_weights):
    print(f'{name:<16} {freq*100:>9.2f}%  {w:>8.3f}  {"█"*int(w*3)}')

weight_tensor = torch.FloatTensor(class_weights).to(device)


# ── Dice Loss ────────────────────────────────────────────────────────────────
class DiceLoss(nn.Module):
    def __init__(self, smooth=1.0):
        super().__init__()
        self.smooth = smooth

    def forward(self, logits, targets):
        probs      = F.softmax(logits, dim=1)                              # [B,C,H,W]
        B, C, H, W = probs.shape
        targets_oh = F.one_hot(targets, C).permute(0,3,1,2).float()        # [B,C,H,W]
        p_flat = probs.view(B, C, -1)
        t_flat = targets_oh.view(B, C, -1)
        inter  = (p_flat * t_flat).sum(-1)
        denom  = p_flat.sum(-1) + t_flat.sum(-1)
        dice   = 1.0 - (2.0 * inter + self.smooth) / (denom + self.smooth)
        return dice.mean()


# ── Combined Loss ────────────────────────────────────────────────────────────
class CombinedLoss(nn.Module):
    def __init__(self, weight_tensor, dice_w=0.5, ce_w=0.5):
        super().__init__()
        self.ce   = nn.CrossEntropyLoss(weight=weight_tensor)
        self.dice = DiceLoss()
        self.dw   = dice_w
        self.cw   = ce_w

    def forward(self, logits, targets):
        return self.cw * self.ce(logits, targets) + self.dw * self.dice(logits, targets)

criterion = CombinedLoss(weight_tensor)
print('\n✅ Combined Dice + CrossEntropy loss ready')
# -----
import torch.optim as optim

NUM_EPOCHS = 30     # change to 50 for better results if time allows

# Two-group LR: lower for pretrained encoder, higher for new decoder head
optimizer = optim.AdamW([
    {'params': model.encoder.parameters(),          'lr': 1e-4},
    {'params': model.decoder.parameters(),          'lr': 3e-4},
    {'params': model.segmentation_head.parameters(),'lr': 3e-4},
], weight_decay=1e-4)

scheduler = optim.lr_scheduler.CosineAnnealingLR(
    optimizer, T_max=NUM_EPOCHS, eta_min=1e-6
)

# ── Metrics helper ───────────────────────────────────────────────────────────
def compute_metrics(logits, targets, num_classes=NUM_CLASSES):
    """Returns pixel_accuracy, mean_IoU, per_class_IoU_list."""
    preds = logits.argmax(dim=1)
    p_flat = preds.view(-1)
    t_flat = targets.view(-1)

    pix_acc = (p_flat == t_flat).float().mean().item()

    ious = []
    for c in range(num_classes):
        pred_c   = p_flat == c
        target_c = t_flat == c
        inter = (pred_c & target_c).sum().item()
        union = (pred_c | target_c).sum().item()
        ious.append(inter / union if union > 0 else float('nan'))

    miou = float(np.nanmean(ious))
    return pix_acc, miou, ious

print(f'Optimizer : AdamW  (encoder lr=1e-4, decoder lr=3e-4, wd=1e-4)')
print(f'Scheduler : CosineAnnealing  T_max={NUM_EPOCHS}')
print(f'Epochs    : {NUM_EPOCHS},  Batch size: {BATCH_SIZE},  Image size: {IMG_SIZE}×{IMG_SIZE}')
# -----
import time

os.makedirs('/kaggle/working/checkpoints', exist_ok=True)

history = {
    'train_loss': [], 'val_loss':  [],
    'train_acc':  [], 'val_acc':   [],
    'val_miou':   [], 'lr':        []
}

best_miou  = 0.0
best_epoch = 0

print('=' * 72)
print(f'  DeepLabV3+(ResNet50) | {NUM_EPOCHS} epochs | {IMG_SIZE}px | {device}')
print('=' * 72)

for epoch in range(1, NUM_EPOCHS + 1):
    t0 = time.time()

    # ── TRAIN ────────────────────────────────────────────────────────────────
    model.train()
    train_loss = 0.0
    train_correct = train_total = 0

    for imgs, masks in train_loader:
        imgs, masks = imgs.to(device), masks.to(device)
        optimizer.zero_grad()
        logits = model(imgs)
        loss   = criterion(logits, masks)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()

        train_loss    += loss.item() * imgs.size(0)
        preds          = logits.argmax(1)
        train_correct += (preds == masks).sum().item()
        train_total   += masks.numel()

    scheduler.step()
    avg_train_loss = train_loss / len(train_ds)
    avg_train_acc  = train_correct / train_total

    # ── VALIDATE ─────────────────────────────────────────────────────────────
    model.eval()
    val_loss = 0.0
    all_logits_list, all_masks_list = [], []

    with torch.no_grad():
        for imgs, masks in val_loader:
            imgs, masks = imgs.to(device), masks.to(device)
            logits = model(imgs)
            val_loss += criterion(logits, masks).item() * imgs.size(0)
            all_logits_list.append(logits.cpu())
            all_masks_list.append(masks.cpu())

    all_logits   = torch.cat(all_logits_list)
    all_masks    = torch.cat(all_masks_list)
    avg_val_loss = val_loss / len(val_ds)
    val_acc, val_miou, val_ious = compute_metrics(all_logits, all_masks)

    # ── Logging ───────────────────────────────────────────────────────────────
    lr_now = optimizer.param_groups[0]['lr']
    history['train_loss'].append(avg_train_loss)
    history['val_loss'].append(avg_val_loss)
    history['train_acc'].append(avg_train_acc)
    history['val_acc'].append(val_acc)
    history['val_miou'].append(val_miou)
    history['lr'].append(lr_now)

    # ── Save best ─────────────────────────────────────────────────────────────
    tag = ''
    if val_miou > best_miou:
        best_miou, best_epoch = val_miou, epoch
        torch.save({
            'epoch': epoch,
            'model_state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'val_miou': val_miou,
            'val_acc':  val_acc,
            'num_classes': NUM_CLASSES,
            'img_size': IMG_SIZE,
        }, '/kaggle/working/checkpoints/best_model.pth')
        tag = '  ⭐ NEW BEST'

    elapsed = time.time() - t0
    print(f'Ep {epoch:03d}/{NUM_EPOCHS} | '
          f'TrLoss {avg_train_loss:.4f} | VaLoss {avg_val_loss:.4f} | '
          f'TrAcc {avg_train_acc:.4f} | VaAcc {val_acc:.4f} | '
          f'mIoU {val_miou:.4f} | LR {lr_now:.1e} | {elapsed:.0f}s{tag}')

    # Per-class IoU every 5 epochs
    if epoch % 5 == 0:
        print('  Per-class IoU:')
        for name, iou in zip(CLASS_NAMES, val_ious):
            if np.isnan(iou):
                print(f'    {name:<16}: N/A  (absent in val)')
            else:
                print(f'    {name:<16}: {iou:.4f}  {"█" * int(iou*25)}')
        print()

print('=' * 72)
print(f'Done.  Best mIoU = {best_miou:.4f}  @ epoch {best_epoch}')
print('=' * 72)
# -----
ep = range(1, len(history['train_loss']) + 1)
fig, axes = plt.subplots(1, 3, figsize=(18, 5))

axes[0].plot(ep, history['train_loss'], label='Train', color='#e63946')
axes[0].plot(ep, history['val_loss'],   label='Val',   color='#457b9d')
axes[0].set_title('Loss', fontsize=14); axes[0].set_xlabel('Epoch')
axes[0].legend(); axes[0].grid(alpha=0.3)

axes[1].plot(ep, history['train_acc'], label='Train', color='#e63946')
axes[1].plot(ep, history['val_acc'],   label='Val',   color='#457b9d')
axes[1].set_title('Pixel Accuracy', fontsize=14); axes[1].set_xlabel('Epoch')
axes[1].legend(); axes[1].grid(alpha=0.3)

axes[2].plot(ep, history['val_miou'], color='#2a9d8f', linewidth=2)
axes[2].axhline(best_miou, color='orange', linestyle='--',
                label=f'Best {best_miou:.4f} @ ep {best_epoch}')
axes[2].set_title('Val mIoU', fontsize=14); axes[2].set_xlabel('Epoch')
axes[2].legend(); axes[2].grid(alpha=0.3)

plt.suptitle('DeepLabV3+(ResNet50) — Training History', fontsize=15, y=1.02)
plt.tight_layout()
plt.savefig('/kaggle/working/training_curves.png', dpi=150, bbox_inches='tight')
plt.show()
print('✅ /kaggle/working/training_curves.png')
# -----
# Load best checkpoint
ckpt = torch.load('/kaggle/working/checkpoints/best_model.pth', map_location=device)
model.load_state_dict(ckpt['model_state_dict'])
print(f"Best model: epoch {ckpt['epoch']},  val mIoU = {ckpt['val_miou']:.4f}")

model.eval()
all_logits_list, all_masks_list = [], []
with torch.no_grad():
    for imgs, masks in val_loader:
        logits = model(imgs.to(device))
        all_logits_list.append(logits.cpu())
        all_masks_list.append(masks)

all_logits = torch.cat(all_logits_list)
all_masks  = torch.cat(all_masks_list)
val_acc, val_miou, val_ious = compute_metrics(all_logits, all_masks)

print(f'\n📊 Final Validation Results')
print(f'  Pixel Accuracy  : {val_acc:.4f}  ({val_acc*100:.2f}%)')
print(f'  Mean IoU (mIoU) : {val_miou:.4f}')
print(f'\n  {"Class":<16}  {"IoU":>8}')
print('  ' + '-'*28)
for name, iou in zip(CLASS_NAMES, val_ious):
    if np.isnan(iou):
        print(f'  {name:<16}    N/A  (absent)')
    else:
        bar = '█' * int(iou * 30)
        print(f'  {name:<16}  {iou:>8.4f}  {bar}')
# -----
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406])
IMAGENET_STD  = np.array([0.229, 0.224, 0.225])

n_show = 6
import random
random.seed(42)
chosen = random.sample(sorted(os.listdir(VAL_IMG_DIR)), n_show)

model.eval()
fig, axes = plt.subplots(n_show, 3, figsize=(14, n_show * 4))
axes[0,0].set_title('Input',       fontsize=13)
axes[0,1].set_title('Ground Truth',fontsize=13)
axes[0,2].set_title('Prediction',  fontsize=13)

for row, fname in enumerate(chosen):
    img_rgb = cv2.cvtColor(cv2.imread(os.path.join(VAL_IMG_DIR, fname)), cv2.COLOR_BGR2RGB)
    gt_raw  = np.array(Image.open(os.path.join(VAL_MASK_DIR, fname)))
    if gt_raw.ndim == 3: gt_raw = gt_raw[:,:,0]

    gt_idx = np.zeros_like(gt_raw, dtype=np.int64)
    for val, idx in VAL_TO_IDX.items():
        gt_idx[gt_raw == val] = idx

    aug = val_transform(image=img_rgb, mask=gt_idx)
    inp = aug['image'].unsqueeze(0).to(device)
    with torch.no_grad():
        pred_idx = model(inp).argmax(1).squeeze().cpu().numpy()

    axes[row,0].imshow(img_rgb)
    axes[row,1].imshow(idx_mask_to_color(gt_idx))
    axes[row,2].imshow(idx_mask_to_color(pred_idx))
    for ax in axes[row]: ax.axis('off')
    axes[row,0].set_ylabel(fname, fontsize=7)

patches = [mpatches.Patch(color=hx, label=nm) for (nm,hx) in CLASS_INFO.values()]
fig.legend(handles=patches, loc='lower center', ncol=5, fontsize=9, bbox_to_anchor=(0.5,-0.04))
plt.suptitle('Validation: Ground Truth vs Prediction', fontsize=15)
plt.tight_layout()
plt.savefig('/kaggle/working/val_predictions.png', dpi=120, bbox_inches='tight')
plt.show()
print('✅ /kaggle/working/val_predictions.png')
# -----
os.makedirs('/kaggle/working/test_predictions', exist_ok=True)

model.eval()
print(f'Running inference on {len(test_ds)} test images...')

with torch.no_grad():
    for batch_imgs, fnames in test_loader:
        preds = model(batch_imgs.to(device)).argmax(1).cpu().numpy()
        for pred, fname in zip(preds, fnames):
            color_out = idx_mask_to_color(pred)
            Image.fromarray(color_out).save(f'/kaggle/working/test_predictions/{fname}')

n_saved = len(os.listdir('/kaggle/working/test_predictions'))
print(f'✅ Saved {n_saved} prediction images → /kaggle/working/test_predictions/')

# Show 3 examples
test_fnames = sorted(os.listdir(TEST_IMG_DIR))[:3]
fig, axes = plt.subplots(len(test_fnames), 2, figsize=(10, 4*len(test_fnames)))
axes[0,0].set_title('Test Input'); axes[0,1].set_title('Predicted Segmentation')
for row, fn in enumerate(test_fnames):
    img_rgb  = cv2.cvtColor(cv2.imread(os.path.join(TEST_IMG_DIR, fn)), cv2.COLOR_BGR2RGB)
    pred_img = np.array(Image.open(f'/kaggle/working/test_predictions/{fn}'))
    axes[row,0].imshow(img_rgb);  axes[row,0].axis('off')
    axes[row,1].imshow(pred_img); axes[row,1].axis('off')
    axes[row,0].set_ylabel(fn, fontsize=8)
plt.tight_layout()
plt.savefig('/kaggle/working/test_sample_predictions.png', dpi=120, bbox_inches='tight')
plt.show()
# -----
from sklearn.metrics import confusion_matrix
import seaborn as sns

TEST_MASK_DIR = os.path.join(BASE, 'Offroad_Segmentation_testImages/Segmentation')

has_test_masks = os.path.isdir(TEST_MASK_DIR) and len(os.listdir(TEST_MASK_DIR)) > 0
print(f'Test mask directory : {TEST_MASK_DIR}')
print(f'Masks available     : {has_test_masks}  ({len(os.listdir(TEST_MASK_DIR)) if has_test_masks else 0} files)')

if not has_test_masks:
    print('\n⚠️  No test masks found — skipping metric computation.')
    print('   Only prediction images have been saved to /kaggle/working/test_predictions/')
else:
    # ── Dataset with test masks ──────────────────────────────────────────────
    test_eval_ds = OffroadDataset(TEST_IMG_DIR, TEST_MASK_DIR, val_transform)
    test_eval_loader = DataLoader(test_eval_ds, batch_size=BATCH_SIZE,
                                  shuffle=False, num_workers=2, pin_memory=True)

    # ── Accumulate all predictions and targets ───────────────────────────────
    model.eval()
    all_preds_list, all_masks_list = [], []
    test_loss_total = 0.0

    with torch.no_grad():
        for imgs, masks in test_eval_loader:
            imgs, masks = imgs.to(device), masks.to(device)
            logits = model(imgs)
            test_loss_total += criterion(logits, masks).item() * imgs.size(0)
            preds = logits.argmax(1)
            all_preds_list.append(preds.cpu())
            all_masks_list.append(masks.cpu())

    all_preds = torch.cat(all_preds_list).numpy().flatten()   # [N*H*W]
    all_masks = torch.cat(all_masks_list).numpy().flatten()   # [N*H*W]
    avg_test_loss = test_loss_total / len(test_eval_ds)

    # ── Core metrics ─────────────────────────────────────────────────────────
    pixel_acc = (all_preds == all_masks).mean()

    # Per-class IoU, Precision, Recall, F1
    iou_list, prec_list, rec_list, f1_list = [], [], [], []
    for c in range(NUM_CLASSES):
        tp = int(((all_preds == c) & (all_masks == c)).sum())
        fp = int(((all_preds == c) & (all_masks != c)).sum())
        fn = int(((all_preds != c) & (all_masks == c)).sum())
        union = tp + fp + fn

        iou  = tp / union       if union > 0            else float('nan')
        prec = tp / (tp + fp)   if (tp + fp) > 0        else float('nan')
        rec  = tp / (tp + fn)   if (tp + fn) > 0        else float('nan')
        f1   = (2 * tp) / (2*tp + fp + fn) if (2*tp + fp + fn) > 0 else float('nan')

        iou_list.append(iou)
        prec_list.append(prec)
        rec_list.append(rec)
        f1_list.append(f1)

    mean_iou  = float(np.nanmean(iou_list))
    mean_prec = float(np.nanmean(prec_list))
    mean_rec  = float(np.nanmean(rec_list))
    mean_f1   = float(np.nanmean(f1_list))

    # ── Print summary ─────────────────────────────────────────────────────────
    print('\n' + '='*60)
    print('  📊  TEST SET EVALUATION RESULTS')
    print('='*60)
    print(f'  Test Loss      : {avg_test_loss:.4f}')
    print(f'  Pixel Accuracy : {pixel_acc:.4f}  ({pixel_acc*100:.2f}%)')
    print(f'  Mean IoU       : {mean_iou:.4f}')
    print(f'  Mean Precision : {mean_prec:.4f}')
    print(f'  Mean Recall    : {mean_rec:.4f}')
    print(f'  Mean F1 Score  : {mean_f1:.4f}')
    print('='*60)
    print(f'\n  {"Class":<16} {"IoU":>8}  {"Prec":>8}  {"Recall":>8}  {"F1":>8}')
    print(f'  {"-"*56}')
    for name, iou, prec, rec, f1 in zip(CLASS_NAMES, iou_list, prec_list, rec_list, f1_list):
        def fmt(v): return f'{v:.4f}' if not np.isnan(v) else '  N/A '
        bar = '█' * int((iou if not np.isnan(iou) else 0) * 20)
        print(f'  {name:<16} {fmt(iou):>8}  {fmt(prec):>8}  {fmt(rec):>8}  {fmt(f1):>8}  {bar}')
    print('='*60)

    # ── Save scores to CSV ────────────────────────────────────────────────────
    import csv
    scores_path = '/kaggle/working/test_scores.csv'
    with open(scores_path, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['Class', 'IoU', 'Precision', 'Recall', 'F1'])
        for name, iou, prec, rec, f1 in zip(CLASS_NAMES, iou_list, prec_list, rec_list, f1_list):
            w.writerow([name,
                        round(iou,4)  if not np.isnan(iou)  else 'N/A',
                        round(prec,4) if not np.isnan(prec) else 'N/A',
                        round(rec,4)  if not np.isnan(rec)  else 'N/A',
                        round(f1,4)   if not np.isnan(f1)   else 'N/A'])
        w.writerow(['MEAN',
                    round(mean_iou,4), round(mean_prec,4),
                    round(mean_rec,4), round(mean_f1,4)])
        w.writerow([])
        w.writerow(['Pixel Accuracy', round(float(pixel_acc),4)])
        w.writerow(['Test Loss',      round(avg_test_loss,4)])
    print(f'\n✅ Scores saved → {scores_path}')

    # ── Confusion Matrix ──────────────────────────────────────────────────────
    # Subsample for speed (up to 2M pixels is plenty)
    MAX_PX = 2_000_000
    if len(all_preds) > MAX_PX:
        idx = np.random.choice(len(all_preds), MAX_PX, replace=False)
        p_sub, m_sub = all_preds[idx], all_masks[idx]
    else:
        p_sub, m_sub = all_preds, all_masks

    cm = confusion_matrix(m_sub, p_sub, labels=list(range(NUM_CLASSES)))
    cm_norm = cm.astype(float) / (cm.sum(axis=1, keepdims=True) + 1e-9)  # row-normalize

    fig, axes = plt.subplots(1, 2, figsize=(20, 8))

    sns.heatmap(cm_norm, annot=True, fmt='.2f', cmap='Blues',
                xticklabels=CLASS_NAMES, yticklabels=CLASS_NAMES,
                ax=axes[0], linewidths=0.5)
    axes[0].set_title('Confusion Matrix (row-normalized)', fontsize=13)
    axes[0].set_xlabel('Predicted'); axes[0].set_ylabel('Ground Truth')
    axes[0].tick_params(axis='x', rotation=45)

    # Per-class IoU bar chart
    valid_names = [n for n,v in zip(CLASS_NAMES, iou_list) if not np.isnan(v)]
    valid_ious  = [v for v in iou_list if not np.isnan(v)]
    colors = [CLASS_INFO[MASK_VALS[CLASS_NAMES.index(n)]][1] for n in valid_names]
    bars = axes[1].bar(valid_names, valid_ious, color=colors, edgecolor='black', linewidth=0.7)
    axes[1].axhline(mean_iou, color='red', linestyle='--', linewidth=1.5,
                    label=f'Mean IoU = {mean_iou:.4f}')
    axes[1].set_ylim(0, 1.05)
    axes[1].set_title('Per-Class IoU on Test Set', fontsize=13)
    axes[1].set_ylabel('IoU'); axes[1].legend()
    axes[1].tick_params(axis='x', rotation=45)
    for bar, val in zip(bars, valid_ious):
        axes[1].text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
                     f'{val:.3f}', ha='center', va='bottom', fontsize=8)

    plt.suptitle(f'Test Set Results  |  mIoU={mean_iou:.4f}  |  PixAcc={pixel_acc:.4f}',
                 fontsize=14)
    plt.tight_layout()
    plt.savefig('/kaggle/working/test_evaluation.png', dpi=150, bbox_inches='tight')
    plt.show()
    print('✅ /kaggle/working/test_evaluation.png')
# -----
import csv

csv_path = '/kaggle/working/training_history.csv'
with open(csv_path, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=history.keys())
    writer.writeheader()
    for row_vals in zip(*history.values()):
        writer.writerow(dict(zip(history.keys(), row_vals)))

print(f'✅ Training history saved → {csv_path}')
print(f'\n📋 Final Summary')
print(f'  Best Val mIoU    : {best_miou:.4f}')
print(f'  Best Epoch       : {best_epoch}/{NUM_EPOCHS}')
print(f'  Final Val Acc    : {history["val_acc"][-1]:.4f}')
print(f'  Final Train Loss : {history["train_loss"][-1]:.4f}')
print()
print('📁 Output files in /kaggle/working/')
for fn in sorted(os.listdir('/kaggle/working')):
    size = os.path.getsize(f'/kaggle/working/{fn}')
    if os.path.isdir(f'/kaggle/working/{fn}'):
        n = len(os.listdir(f'/kaggle/working/{fn}'))
        print(f'  📂 {fn}/  ({n} files)')
    else:
        print(f'  📄 {fn}  ({size/1024:.1f} KB)')
# -----
