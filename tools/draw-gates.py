#!/usr/bin/env python3
"""Evidence / gate / ending matrix for the Pocket Story mainline (design doc image)."""
from PIL import Image, ImageDraw, ImageFont

W = 1560
BG = (255, 255, 255)
INK = (28, 32, 38)
MUTED = (108, 116, 126)
LINE = (208, 214, 222)
ACCENT = (176, 42, 58)
HEAD = (243, 245, 248)
OK = (36, 124, 80)
NO = (176, 182, 190)
TRUE_BG = (233, 246, 238)
MID_BG = (240, 245, 252)
LOW_BG = (250, 244, 246)

FONT = "/System/Library/Fonts/Hiragino Sans GB.ttc"
def font(s, i=0): return ImageFont.truetype(FONT, s, index=min(i, 1))
F_TITLE = font(38, 1); F_SUB = font(18); F_H = font(19, 1); F_B = font(18); F_S = font(16); F_TINY = font(14)

img = Image.new("RGB", (W, 2100), BG)
d = ImageDraw.Draw(img)

def text(x, y, s, f, fill=INK): d.text((x, y), s, font=f, fill=fill)

def wrap(s, f, maxw):
    lines, cur = [], ""
    for ch in s:
        if ch == "\n": lines.append(cur); cur = ""; continue
        if d.textlength(cur + ch, font=f) > maxw: lines.append(cur); cur = ch
        else: cur += ch
    lines.append(cur); return lines

def para(x, y, s, f, maxw, fill=INK, lh=1.45):
    step = int(f.size * lh); ls = wrap(s, f, maxw)
    for i, l in enumerate(ls): text(x, y + i * step, l, f, fill)
    return y + len(ls) * step

def row(y, h, cells, widths, x0=70, fill=None, bold=False, sizes=None, colors=None, aligns=None):
    x = x0
    if fill: d.rectangle([x0, y, x0 + sum(widths), y + h], fill=fill)
    for i, (c, w) in enumerate(zip(cells, widths)):
        f = sizes[i] if sizes else (F_H if bold else F_B)
        col = colors[i] if colors else INK
        al = aligns[i] if aligns else "left"
        lines = wrap(str(c), f, w - 22)
        ty = y + (h - len(lines) * int(f.size * 1.35)) // 2
        for j, l in enumerate(lines):
            tw = d.textlength(l, font=f)
            tx = x + 11 if al == "left" else (x + (w - tw) // 2 if al == "center" else x + w - tw - 11)
            text(tx, ty + j * int(f.size * 1.35), l, f, col)
        x += w
    d.line([x0, y + h, x0 + sum(widths), y + h], fill=LINE, width=1)

# header
text(70, 50, "POCKET STORY · 证据门槛与结局判定", F_TITLE, INK)
text(72, 104, "这张图定的是「玩到哪一步、收集到什么、最后落到哪个结局」，比章节顺序更影响实现。", F_SUB, MUTED)
d.line([70, 140, W - 70, 140], fill=LINE, width=2)

# ---------------- table 1: chapter gates ----------------
text(70, 168, "一、每章的解锁条件", F_H, ACCENT)
y = 206
widths = [96, 210, 470, 470, 104]
heads = ["章节", "标题", "必需证据", "可选 / 干扰证据", "门槛"]
row(y, 46, heads, widths, fill=HEAD, bold=True, aligns=["center", "left", "left", "left", "center"])
y += 46
ROWS = [
    ("序章", "捡到手机", "锁屏 4 条提示", "无", "开锁"),
    ("第一章", "这是谁的手机", "日历 · 短信 · 相册 · KKT · 地图（5 项）", "壁纸、行程截图", "5 项"),
    ("第二章", "她们发生了什么", "日本 KKT 对话 · Pann 疑问帖", "评论区反驳（必读，用于误判）", "2 项"),
    ("第三章", "公开世界一切正常", "Instagram · YouTube", "LYSN、搬运帖、带妈妈出行（干扰）", "2 项"),
    ("第四章", "以前不是这样的", "旧 Vlog · 旧相册 · 旧 IG（任 2）", "旧电话记录（强化对比）", "2 项"),
    ("第五章", "真正的争执", "见下：五项中凑 4 项", "—", "4/5"),
    ("第六章", "最后一次聊天", "第五章完成", "情绪锚点决定结局", "结算"),
]
for i, r in enumerate(ROWS):
    row(y, 58, r, widths, fill=(250, 251, 253) if i % 2 else None)
    y += 58

# ---------------- table 2: chapter 5 evidence ----------------
y += 34
text(70, y, "二、第五章：五项证据（需要凑几项，是你拍板的第 1 个问题）", F_H, ACCENT)
y += 40
widths2 = [250, 430, 460, 210]
row(y, 44, ["证据", "在哪看", "它能证明什么", "是否必选"], widths2, fill=HEAD, bold=True)
y += 44
E5 = [
    ("连续未接来电", "电话 App · 通话记录", "柱现真的反复找过她，不是“没发现”", "建议必选"),
    ("落泪的日期", "日历 + 论坛 / 相册时间", "把 8 月的公开活动与情绪对上", "可选"),
    ("搜索记录", "Safari · 搜索历史", "失眠、悲伤、沟通——她一直在想怎么说", "可选"),
    ("备忘录没写完的话", "备忘录", "她写下又删掉的句子，最接近真心", "建议必选"),
    ("KKT 消息断层", "KakaoTalk + 日历", "争执发生的时间窗，以及之后的“只谈事务”", "可选"),
]
for i, r in enumerate(E5):
    row(y, 56, r, widths2, fill=(250, 251, 253) if i % 2 else None)
    y += 56

# ---------------- table 3: ending matrix ----------------
y += 34
text(70, y, "三、结局判定真值表（建议方案，待你确认）", F_H, ACCENT)
y += 44
cols = [300, 150, 150, 170, 170, 170]
row(y, 62, ["条件 \\ 结局", "真 · 门没锁", "普通 · 要我过去吗", "偏离 · 明天再说"], [300, 200, 230, 230], fill=HEAD, bold=True, aligns=["left", "center", "center", "center"])
y += 62
MATRIX = [
    ("完成第四章（知道关系变了）", "必须", "必须", "不要求"),
    ("情绪锚点 4 项（表妹 / 未接来电 / 八月旧聊天 / 仍在照顾）", "至少 3 项", "少于 3 项", "0 项"),
    ("其中必须包含「未接来电」", "是", "—", "—"),
    ("玩家理解「替对方决定」", "是", "—", "—"),
    ("结局基调", "第一次允许靠近", "机会出现，结果未知", "修复表面，不碰核心"),
]
for i, (a, b, c, e) in enumerate(MATRIX):
    row(y, 62, [a, b, c, e], [300, 200, 230, 230],
        fill=(250, 251, 253) if i % 2 else None,
        colors=[INK, OK, MUTED, MUTED],
        aligns=["left", "center", "center", "center"])
    y += 62

# ---------------- open questions ----------------
y += 40
d.rounded_rectangle([70, y, W - 70, y + 250], radius=14, fill=(255, 248, 235), outline=(214, 154, 68), width=2)
text(92, y + 18, "需要你决定的 3 件事", F_H, (140, 96, 26))
para(92, y + 58,
     "① 第五章：是「五项里随便凑四项」，还是「四项里必须包含未接来电 + 备忘录」？\n"
     "② 结局：走到结局后就固定，还是允许回第六章重选、把三个都看一遍？\n"
     "③ 偏离结局之后：故事结束，还是还能继续收集证据、再回来触发一次？",
     F_B, W - 190, INK, 1.7)
para(92, y + 196, "另外：手机上现有的旧剧情（机场图 / 论坛传言 / 官方照片）建议整章替换，避免两套主线混在一起。",
     F_S, W - 190, (120, 96, 60), 1.5)

H = y + 300
img = img.crop((0, 0, W, H))
img.save("/Users/pengyixuan/Documents/deepseek-harness/default-workspace/pocket-story/docs-mainline-gates.png")
print("saved", W, H)
