#!/usr/bin/env python3
"""Draw the Pocket Story mainline flow as a PNG tree chart (no game code)."""
from PIL import Image, ImageDraw, ImageFont

W = 1560
BG = (255, 255, 255)
INK = (28, 32, 38)
MUTED = (110, 118, 128)
LINE = (150, 160, 172)
ACCENT = (176, 42, 58)
BOX = (247, 248, 250)
BOX_BORDER = (206, 212, 220)
GATE = (255, 246, 232)
GATE_BORDER = (214, 154, 68)
END_TRUE = (233, 246, 238)
END_TRUE_B = (36, 124, 80)
END_MID = (240, 245, 252)
END_MID_B = (60, 104, 166)
END_LOW = (250, 244, 246)
END_LOW_B = (138, 84, 104)

FONT_PATH = "/System/Library/Fonts/Hiragino Sans GB.ttc"
def font(size, index=0):
    return ImageFont.truetype(FONT_PATH, size, index=min(index, 1))

F_TITLE = font(40, 1)
F_SUB = font(19)
F_STAGE = font(24, 1)
F_BODY = font(18)
F_SMALL = font(16)
F_GATE = font(15, 1)

img = Image.new("RGB", (W, 4200), BG)
d = ImageDraw.Draw(img)

def text(x, y, s, f, fill=INK):
    d.text((x, y), s, font=f, fill=fill)

def wrap(s, f, maxw):
    lines, cur = [], ""
    for ch in s:
        if ch == "\n":
            lines.append(cur); cur = ""; continue
        if d.textlength(cur + ch, font=f) > maxw:
            lines.append(cur); cur = ch
        else:
            cur += ch
    lines.append(cur)
    return lines

def para(x, y, s, f, maxw, fill=INK, lh=1.45):
    step = int(f.size * lh)
    lines = wrap(s, f, maxw)
    for i, line in enumerate(lines):
        text(x, y + i * step, line, f, fill)
    return y + len(lines) * step

def box(x1, y1, x2, y2, fill=BOX, outline=BOX_BORDER, r=14, w=2):
    d.rounded_rectangle([x1, y1, x2, y2], radius=r, fill=fill, outline=outline, width=w)

def arrow(x1, y1, x2, y2, fill=LINE, w=2):
    d.line([x1, y1, x2, y2], fill=fill, width=w)
    s = -1 if y2 > y1 else 1
    d.polygon([(x2, y2), (x2 - 7, y2 + 11 * s), (x2 + 7, y2 + 11 * s)], fill=fill)

text(70, 54, "POCKET STORY · 主线流程树", F_TITLE, INK)
text(72, 110, "序章 + 六章 + 三结局 ｜ 确认主人 → 怀疑关系 → 被公开内容反驳 → 对比过去与现在 → 找到争执原因 → 触发结局",
     F_SUB, MUTED)
d.line([70, 148, W - 70, 148], fill=BOX_BORDER, width=2)

STAGES = [
    ("序章", "捡到手机", "锁屏只有：回酒店了吗 / 未接来电 / 行程提醒 / 此 iPhone 已丢失",
     ["输入 910329 进入桌面", "此时不能确认主人身份"], "开锁即通过"),
    ("第一章", "这是谁的手机？", "自由查看基础软件，确认手机属于涩琪",
     ["日历：日本巡演与彩排", "短信：工作人员的事务信息", "相册：城市、食物、未公开后台照", "KKT：组长老师被置顶", "地图：东京餐厅、展览、便利店"],
     "集齐 5 个身份锚点"),
    ("第二章", "她们发生了什么？", "KKT 全是事务性对话，缺情绪；玩家开始误判",
     ["查看日本巡演期 KKT", "误判：她们是不是不亲密了", "Pann：只有我觉得不一样吗", "评论区多数人反驳：本来就这样"],
     "读完 KKT + Pann 疑问帖"),
    ("第三章", "公开世界里一切正常", "粉丝视角看不到矛盾，用来修正误判",
     ["Instagram：城市与专辑", "LYSN / Weverse：粉丝视角", "YouTube：舞台、回归、旧 Vlog", "干扰项：带妈妈出行、休息方式不同、行程错开"],
     "看过 IG + YouTube"),
    ("第四章", "以前不是这样的", "用去年欧洲巡演与八月回归做对比",
     ["旧欧洲 Vlog / 旧 Instagram", "旧相册：两人份的食物", "以前：直接邀请、无意义闲聊、电话很长", "现在：只剩地点、提醒、注意安全"],
     "完成「以前 / 现在」对比"),
    ("第五章", "真正的争执", "组合多个证据才能还原争执",
     ["通话记录：连续未接来电", "粉丝活动后落泪的日期", "搜索：失眠 / 悲伤 / 沟通", "备忘录：没写完的话", "KKT 消息断层 + 日历时间"],
     "集齐 4 项以上证据"),
    ("第六章", "最后一次聊天", "玩家不替涩琪决定内容，证据决定她敢发什么",
     ["统一开场：你睡了吗 / 没有", "后续分支由已收集证据决定", "三个结局在此结算"], "进入结局判定"),
]

left_x1, left_x2 = 70, 700
right_x1, right_x2 = 740, W - 70
y = 180
last_bottom = 0
for idx, (num, name, lead, bullets, gate) in enumerate(STAGES):
    by = y + 8
    for b in bullets:
        by = para(right_x1 + 18, by, b, F_BODY, right_x2 - right_x1 - 26, INK, 1.4)
    gate_top = by + 12
    right_bottom = gate_top + 34
    h = max(150, right_bottom - y)
    box(left_x1, y, left_x2, y + h)
    text(left_x1 + 22, y + 16, num, F_GATE, ACCENT)
    text(left_x1 + 22, y + 44, name, F_STAGE)
    para(left_x1 + 22, y + 84, lead, F_SMALL, left_x2 - left_x1 - 44, MUTED, 1.45)
    d.rounded_rectangle([right_x1, gate_top, right_x2, gate_top + 34], radius=8, fill=GATE, outline=GATE_BORDER, width=1)
    text(right_x1 + 12, gate_top + 7, "解锁条件：" + gate, F_GATE, (140, 96, 26))
    last_bottom = y + h
    y = last_bottom + 40
    if idx < len(STAGES) - 1:
        arrow((left_x1 + left_x2) // 2, last_bottom + 2, (left_x1 + left_x2) // 2, y - 6)

y += 6
text(left_x1, y, "结局判定 · 第六章结束时按已收集证据结算", F_STAGE, INK)
spine_x = (left_x1 + left_x2) // 2
bus_y = y + 50
d.line([spine_x, last_bottom + 2, spine_x, bus_y], fill=LINE, width=2)

ends = [
    ("真结局 · 门没锁", END_TRUE, END_TRUE_B,
     "情绪锚点齐全：\n· 表妹 / 失去的线索\n· 连续未接来电\n· 八月旧聊天\n· 柱现仍在照顾\n\n玩家理解：问题是\n「替对方决定」，不是不爱\n\n涩琪：门没锁。"),
    ("普通结局 · 要我过去吗？", END_MID, END_MID_B,
     "找到关系变化，\n但没找到悲伤的来源，\n情绪锚点不足。\n\n柱现：要我过去吗？\n\n机会出现了，\n涩琪是否真正开口，\n仍然未知。"),
    ("偏离结局 · 明天再说", END_LOW, END_LOW_B,
     "只看论坛、吃饭、\n公开互动。\n\n把问题误解成\n「最近没有时间相处」。\n\n约了一顿饭，\n真正的矛盾没被触碰。\n\n不是坏结局。"),
]

gap = 30
bw = (W - 140 - 2 * gap) // 3
box_h = 330
ends_y = bus_y + 34
for i, (title, fill, stroke, body) in enumerate(ends):
    x1 = 70 + i * (bw + gap)
    x2 = x1 + bw
    box(x1, ends_y, x2, ends_y + box_h, fill=fill, outline=stroke, w=2)
    text(x1 + 20, ends_y + 18, title, F_STAGE, stroke)
    para(x1 + 20, ends_y + 66, body, F_SMALL, bw - 40, INK, 1.55)

d.line([70 + bw // 2, bus_y, 70 + 2 * (bw + gap) + bw // 2, bus_y], fill=LINE, width=2)
for i in range(3):
    cx = 70 + i * (bw + gap) + bw // 2
    d.line([cx, bus_y, cx, ends_y - 2], fill=LINE, width=2)

ny = ends_y + box_h + 34
d.line([70, ny, W - 70, ny], fill=BOX_BORDER, width=2)
para(70, ny + 22,
     "需要你确认的三点：① 第五章是「任选 4 项」还是「必须包含未接来电与备忘录」；"
     "② 三个结局是选定后固定，还是允许在同一存档回看；③ 偏离结局之后，还能不能继续收集证据再回到第六章。",
     F_BODY, W - 140, INK, 1.6)

H = ny + 130
img = img.crop((0, 0, W, H))
img.save("/Users/pengyixuan/Documents/deepseek-harness/default-workspace/pocket-story/docs-mainline-flow.png")
print("saved", W, H)
