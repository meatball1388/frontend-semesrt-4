from PIL import Image, ImageDraw, ImageFont
import os

sizes = [72, 96, 128, 144, 152, 192, 384, 512]
icons_dir = r'C:\Users\Алексей\Documents\ucheba\front_end\frontend-13-14\practice13-14\icons'

for size in sizes:
    # Создаём изображение
    img = Image.new('RGB', (size, size), color='#4A90D9')
    draw = ImageDraw.Draw(img)
    
    # Рисуем белый круг в центре
    margin = size // 6
    draw.ellipse([margin, margin, size - margin, size - margin], fill='#ffffff')
    
    # Рисуем галочку
    inner_margin = size // 4
    check_size = size // 2
    center = size // 2
    
    # Линии галочки
    stroke_width = max(2, size // 20)
    
    # Левая часть галочки (короткая)
    x1 = center - check_size // 2
    y1 = center
    x2 = center - check_size // 6
    y2 = center + check_size // 3
    
    # Правая часть галочки (длинная)
    x3 = center + check_size // 2
    y3 = center - check_size // 4
    
    draw.line([(x1, y1), (x2, y2), (x3, y3)], fill='#4A90D9', width=stroke_width)
    
    # Сохраняем
    filename = f'icon-{size}x{size}.png'
    img.save(os.path.join(icons_dir, filename))
    print(f'Создан {filename}')

print('Все иконки созданы!')
