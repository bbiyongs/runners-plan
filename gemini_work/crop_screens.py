import os
from PIL import Image

def crop_screens():
    img_path = "예상화면_ver1_0.png"
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return

    img = Image.open(img_path)
    w, h = img.size
    print(f"Original Image Size: {w}x{h}")

    rgb_img = img.convert("RGB")
    pixels = rgb_img.load()

    # Function to get non-white pixel count for a column
    def get_col_non_white(x):
        return sum(1 for y in range(h) if pixels[x, y] != (255, 255, 255))

    # Function to get non-white pixel count for a row
    def get_row_non_white(y):
        return sum(1 for x in range(w) if pixels[x, y] != (255, 255, 255))

    # Dynamically find the best gutters (minimum non-white pixels)
    x1 = min(range(530, 580), key=get_col_non_white)
    x2 = min(range(1080, 1140), key=get_col_non_white)
    y1 = min(range(290, 340), key=get_row_non_white)
    y2 = min(range(600, 660), key=get_row_non_white)

    print(f"Detected columns: 0 -> {x1} -> {x2} -> {w}")
    print(f"Detected rows:    0 -> {y1} -> {y2} -> {h}")

    # Column boundaries: [0, x1, x2, w]
    # Row boundaries: [0, y1, y2, h]
    cols = [0, x1, x2, w]
    rows = [0, y1, y2, h]

    # File names mapping for the 9 screens
    screen_names = [
        "01_로그인_화면.png",
        "02_대시보드.png",
        "03_러닝_기록_목록.png",
        "04_러닝_기록_등록_수정.png",
        "05_목표_관리.png",
        "06_대회_기록_목록.png",
        "07_대회_기록_등록.png",
        "08_통계_분석.png",
        "09_마이페이지.png"
    ]

    idx = 0
    for r in range(3):
        for c in range(3):
            left = cols[c]
            top = rows[r]
            right = cols[c+1]
            bottom = rows[r+1]

            # Crop the sub-image
            cropped = img.crop((left, top, right, bottom))
            filename = screen_names[idx]
            cropped.save(filename)
            print(f"Saved {filename} ({cropped.size[0]}x{cropped.size[1]})")
            idx += 1

if __name__ == "__main__":
    crop_screens()
