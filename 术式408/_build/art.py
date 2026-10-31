#!/usr/bin/env python3
"""笔墨素材生成器：把系统字体渲染成干笔毛笔字，并程序化生成枯笔、墨溅、粗糙分格等纹理。
产物是静态图片（webp），网页不依赖字体文件。素材已存在时跳过；要重画用 --force。"""
import os,sys,glob,hashlib
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from scipy.ndimage import map_coordinates,gaussian_filter
HERE=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(HERE,'..','assets','ink')
def findfont(name):
    for r in ('/System/Library/AssetsV2','/System/Library/Fonts','/Library/Fonts'):
        for f in glob.glob(r+'/**/'+name,recursive=True):return f
    raise SystemExit('缺字体 '+name)
def rng(s):return np.random.default_rng(int(hashlib.md5(str(s).encode()).hexdigest()[:8],16))
def noise(h,w,scale,r,ax=1.0):
    """平滑噪声：scale 越大越粗；ax>1 沿横向拉长"""
    a=r.standard_normal((max(2,int(h/scale))+3,max(2,int(w/(scale*ax)))+3))
    a=(a-a.min())/(a.max()-a.min())
    return np.asarray(Image.fromarray((a*255).astype('uint8')).resize((w,h),Image.BICUBIC),dtype='float32')/255
def ink(mask,seed,rough=3,dry=.5,angle=-.28,splat=0,bleed=.8):
    """mask: 0~1 数组。出边粗糙（只动边缘）+ 斜向飞白（只吃墨不长墨）+ 墨点。返回 0~1 alpha。"""
    r=rng(seed);h,w=mask.shape
    dx=(noise(h,w,16,r)-.5)*rough*2.2+(noise(h,w,5,r)-.5)*rough*1.1
    dy=(noise(h,w,16,r)-.5)*rough*2.2+(noise(h,w,5,r)-.5)*rough*1.1
    yy,xx=np.mgrid[0:h,0:w]
    m=map_coordinates(mask,[yy+dy,xx+dx],order=1,mode='constant')
    if bleed:m=gaussian_filter(m,bleed)
    st=.6*noise(h,w,2.2,r,ax=34)+.4*noise(h,w,6,r,ax=18)
    st=map_coordinates(st,[(yy+xx*angle)%h,xx],order=1,mode='wrap')      # 斜向笔锋
    lo,hi=np.percentile(st,3),np.percentile(st,97);st=np.clip((st-lo)/(hi-lo),0,1)
    core=gaussian_filter((m>.5).astype('float32'),h*.012+3)              # 笔画中心 ≈1，边缘 ≈.5
    bite=np.clip((.62+dry*.42-st)*2.2,0,1)*np.clip((1.05-core)*2.4,0,1)  # 离边缘越近越容易枯
    drag=noise(h,w,40,r,ax=3)                                             # 一整片墨干了的区域
    out=(m>.5+bite*.5*dry+np.clip(drag-.62,0,1)*dry*1.2*(st<.45)).astype('float32')
    if splat:
        ys,xs=np.nonzero(m>.5);d=np.zeros((h,w),'float32')
        for _ in range(int(splat) if len(ys) else 0):
            i=r.integers(len(ys));t=r.uniform(0,6.28);l=r.exponential(h*.1)+h*.03
            cy,cx=int(ys[i]+np.sin(t)*l),int(xs[i]+np.cos(t)*l);rd=max(1,int(r.exponential(h*.004)+1))
            y0,y1,x0,x1=max(cy-rd,0),min(cy+rd+1,h),max(cx-rd,0),min(cx+rd+1,w)
            if y1>y0 and x1>x0:
                g=np.ogrid[y0-cy:y1-cy,x0-cx:x1-cx];d[y0:y1,x0:x1]=np.maximum(d[y0:y1,x0:x1],(g[0]**2+g[1]**2<=rd*rd))
        out=np.maximum(out,d)
    return gaussian_filter(out,.6)
def save(alpha,name,ss=2,color=(255,255,255)):
    """以 ss 倍超采样绘制后缩小，存白色带 alpha 的 webp；网页里作 mask 或 background 使用"""
    p=os.path.join(OUT,name);os.makedirs(os.path.dirname(p),exist_ok=True)
    h,w=alpha.shape;a=Image.fromarray((np.clip(alpha,0,1)*255).astype('uint8')).resize((max(1,w//ss),max(1,h//ss)),Image.LANCZOS)
    im=Image.merge('RGBA',[Image.new('L',a.size,c) for c in color]+[a]);im.save(p,'WEBP',quality=82,method=6,alpha_quality=80)
def text_mask(t,font,size,vertical=False,pad=.22,spacing=0,stroke=0,lean=0,jitter=0,seed=0):
    """逐字摆放，带轻微大小与位置抖动，避免印刷感"""
    r=rng(('t',t,seed));f=ImageFont.truetype(font,size);p=int(size*pad)
    adv=[max(f.getbbox(c)[2],size*.6)+spacing if not vertical else size*1.04+spacing for c in t]
    if vertical:W,H=int(size*1.2)+2*p,int(sum(adv))+2*p
    else:W,H=int(sum(adv))+2*p,int(size*1.25)+2*p
    im=Image.new('L',(W,H),0);x=p;y=p
    for c,a in zip(t,adv):
        s=1+r.uniform(-jitter,jitter);fc=ImageFont.truetype(font,int(size*s))
        dy=r.uniform(-jitter,jitter)*size;dx=r.uniform(-jitter,jitter)*size*.4
        ImageDraw.Draw(im).text((x+dx,y+dy),c,font=fc,fill=255,stroke_width=stroke,stroke_fill=255)
        if vertical:y+=a
        else:x+=a
    if lean:im=im.transform(im.size,Image.AFFINE,(1,lean,-lean*H/2,0,1,0),Image.BICUBIC)
    return np.asarray(im,dtype='float32')/255

# ---------- 字形回退：逐字选有此字的字体 ----------
from fontTools.ttLib import TTFont,TTCollection
_cm={}
def _cmaps(path):
    if path in _cm:return _cm[path]
    if path.endswith('.ttc'):
        fs=TTCollection(path).fonts
    else:fs=[TTFont(path,lazy=True)]
    _cm[path]=[(i,f.getBestCmap()) for i,f in enumerate(fs)]
    return _cm[path]
def chain(*names):
    out=[]
    for n in names:
        p=findfont(n)
        for i,cm in _cmaps(p):out.append((p,i,cm))
    return out
def pick(c,ch):
    for p,i,cm in ch:
        if ord(c) in cm:return p,i
    raise SystemExit('无字形 '+c)
def lines_mask(lines,ch,size,vertical=False,pad=.25,stroke=3,lean=-.13,jitter=.03,gap=1.12,seed=0,latin=None):
    """多行混排。ch 是字体回退链；ASCII 走 latin 链。"""
    r=rng(('L',str(lines),seed))
    def adv(c):
        if vertical:return size*1.03
        p,i=pick(c,latin if latin and ord(c)<0x2100 else ch)
        return ImageFont.truetype(p,size,index=i).getlength(c)*1.0+(0 if ord(c)<128 else size*.02)
    if vertical:
        H=int(max(len(l) for l in lines)*size*1.03+2*size*pad);W=int(len(lines)*size*gap+2*size*pad)
    else:
        W=int(max(sum(adv(c) for c in l) for l in lines)+2*size*pad);H=int(len(lines)*size*gap+2*size*pad)
    im=Image.new('L',(W,H),0);d=ImageDraw.Draw(im)
    for li,l in enumerate(lines):
        x=size*pad;y=size*pad
        if vertical:x=W-size*pad-size*gap*(li+1)+size*(gap-1)/2
        else:y+=li*size*gap
        for c in l:
            p,i=pick(c,latin if latin and ord(c)<0x2100 else ch)
            sz=int(size*(1+r.uniform(-jitter,jitter)));f=ImageFont.truetype(p,sz,index=i)
            d.text((x,y+r.uniform(-jitter,jitter)*size),c,font=f,fill=255,stroke_width=stroke,stroke_fill=255)
            if vertical:y+=adv(c)
            else:x+=adv(c)
    if lean and not vertical:im=im.transform(im.size,Image.AFFINE,(1,lean,-lean*H/2,0,1,0),Image.BICUBIC)
    return np.asarray(im,dtype='float32')/255
def wrap(t,n=8):
    """标题折行：优先在标点或「与」处断"""
    if len(t)<=n:return [t]
    mid=len(t)/2;best=None
    for i,c in enumerate(t):
        if c in '、：：与和·' :
            k=i+1 if c!='与' and c!='和' else i
            if best is None or abs(k-mid)<abs(best-mid):best=k
    if best is None or abs(best-mid)>len(t)*.3:best=int(round(mid))
    return [t[:best].rstrip('、'),t[best:].lstrip('、')]
# ---------- 纹理 ----------
def rgba_save(rgb,alpha,name,ss=1,quality=80):
    p=os.path.join(OUT,name);os.makedirs(os.path.dirname(p),exist_ok=True)
    a=Image.fromarray((np.clip(alpha,0,1)*255).astype('uint8'));c=[Image.fromarray(np.clip(rgb[...,i],0,255).astype('uint8')) for i in range(3)]
    im=Image.merge('RGBA',c+[a])
    if ss>1:im=im.resize((im.width//ss,im.height//ss),Image.LANCZOS)
    im.save(p,'WEBP',quality=quality,method=6,alpha_quality=75)
def paper(name,base,amp,fib):
    r=rng(name);S=512
    a=np.zeros((S,S),'float32')
    for sc,w in ((1,.35),(3,.3),(9,.2),(40,.15)):
        n=r.standard_normal((S//sc+1,S//sc+1));a+=w*np.kron(n,np.ones((sc,sc)))[:S,:S]
    for _ in range(90):                                    # 纸纤维
        x,y=r.integers(S,size=2);t=r.uniform(0,6.28);l=int(r.integers(8,46))
        for i in range(l):a[int(y+np.sin(t)*i)%S,int(x+np.cos(t)*i)%S]+=fib
    v=np.clip(np.stack([base[i]+a*amp for i in range(3)],-1),0,255).astype('uint8')
    Image.fromarray(v).save(os.path.join(OUT,name),'WEBP',quality=74,method=6)
def speed(name,W=1800,H=1100,cx=.68,cy=.42,n=420,void=.2,seed=1):
    """集中线：手绘感的楔形细线，从外向中心变细，长度不一"""
    r=rng(seed);S=2;im=Image.new('L',(W*S,H*S),0);d=ImageDraw.Draw(im);C=(W*S*cx,H*S*cy);R=np.hypot(W,H)*S
    for _ in range(n):
        t=r.uniform(0,6.283);w=r.exponential(.0036)+.0004;inner=R*(void+r.exponential(.09))
        ca,sa=np.cos(t),np.sin(t);a,b=np.cos(t+w),np.sin(t+w);a2,b2=np.cos(t-w),np.sin(t-w)
        d.polygon([(C[0]+ca*inner,C[1]+sa*inner),(C[0]+a*R,C[1]+b*R),(C[0]+a2*R,C[1]+b2*R)],fill=255)
    a=np.asarray(im,dtype='float32')/255
    a=ink(a,name,rough=2,dry=.25,bleed=.5);save(a,name,ss=S)
def edge(name,W=1800,H=90,amp=1,seed=2,tongues=True):
    """向下的撕裂墨边：顶端实，往下成不规则舌状"""
    r=rng(seed);yy,xx=np.mgrid[0:H,0:W];n=.45*noise(H,W,5,r,ax=.1)+.35*noise(H,W,16,r,ax=.4)+.2*noise(H,W,50,r,ax=3)
    n=(n-n.min())/(n.max()-n.min());g=yy/H
    a=(n>g*.72*amp+.2).astype('float32');a[:8]=1
    a=gaussian_filter(a,.7);save(a,name,ss=1)
def flame(name,W=1800,H=420,seed=3):
    """咒力黑焰：底部实、向上撕开，带飞散的墨粒"""
    r=rng(seed);yy,xx=np.mgrid[0:H,0:W];g=1-yy/H
    n=.4*noise(H,W,12,r,ax=.1)+.4*noise(H,W,36,r,ax=.22)+.2*noise(H,W,110,r,ax=.8)
    n=(n-n.min())/(n.max()-n.min())
    a=(n>g*.86+.1).astype('float32')
    specks=(noise(H,W,3,r)>.83)*(g<.95)*(n>g*.9-.03)
    a=np.maximum(a,specks*1.0);a=gaussian_filter(a,.6);save(a,name,ss=1)
def enso(name,S=1000,seed=4):
    """圆相：一笔干墨画的圈"""
    r=rng(seed);yy,xx=np.mgrid[0:S,0:S];c=S/2;x=xx-c;y=yy-c;rad=np.hypot(x,y);th=(np.arctan2(y,x)+np.pi*.6)%(2*np.pi)/(2*np.pi)
    wob=(noise(S,S,70,r)-.5)*S*.04;R=S*.40+wob;wd=S*(.075-.05*th+.015*np.sin(th*11))
    m=np.clip(1.2-np.abs(rad-R)/wd,0,1)*(th<.965);a=ink(np.clip(m*2,0,1),name,rough=4,dry=.95,angle=.9,splat=90);save(a,name,ss=2)
def swath(name,W=1200,H=150,seed=5):
    """一笔横扫的墨带（小节标题底）"""
    r=rng(seed);yy,xx=np.mgrid[0:H,0:W];t=xx/W
    top=H*(.10+.05*noise(H,W,300,r,ax=4));bot=H*(.90-.05*noise(H,W,300,r,ax=4))
    m=((yy>top)&(yy<bot)).astype('float32');m*=(xx<W*(.965+.03*noise(H,W,3,r,ax=.1)))
    a=ink(m,name,rough=3,dry=.95,angle=0,splat=26)
    # 收笔枯散
    st=noise(H,W,2.2,r,ax=40);tail=np.clip((t-.72)/.26,0,1);a*=(st>tail*.62);save(a,name,ss=1)
def frame(name,col,S=240,R=0,seed=6,w=7):
    """粗糙手绘框（9 宫格 border-image 用）：同一张图四边线宽不均"""
    r=rng(seed);a=np.zeros((S,S),'float32');p=30
    im=Image.new('L',(S*2,S*2),0);d=ImageDraw.Draw(im);d.rounded_rectangle((p*2,p*2,(S-p)*2,(S-p)*2),radius=R*2,outline=255,width=w*2)
    m=np.asarray(im,dtype='float32')/255;a=ink(m,name,rough=2.6,dry=.55,angle=.5,bleed=.6)
    a=np.asarray(Image.fromarray((a*255).astype('uint8')).resize((S,S),Image.LANCZOS),dtype='float32')/255
    rgb=np.ones((S,S,3))*np.array(col);rgba_save(rgb,a,name,quality=86)
def hatch(name,S=520,seed=7,n=240):
    """手绘排线：密度从一角往外衰减"""
    r=rng(seed);im=Image.new('L',(S*2,S*2),0);d=ImageDraw.Draw(im)
    for _ in range(n):
        x,y=r.uniform(0,S*2,2);f=np.exp(-(x+y)/(S*1.2))
        if r.uniform()>f+.08:continue
        l=r.uniform(40,190);an=np.radians(-52+r.normal(0,4));d.line((x,y,x+np.cos(an)*l,y+np.sin(an)*l),fill=255,width=int(r.integers(2,5)))
    a=ink(np.asarray(im,dtype='float32')/255,name,rough=1.6,dry=.4,bleed=.5);save(a,name)
def splats(name,S=520,seed=8,n=70):
    r=rng(seed);yy,xx=np.mgrid[0:S,0:S];c=S/2;th=np.arctan2(yy-c,xx-c);rad=np.hypot(xx-c,yy-c)/S
    sp=np.zeros((S,S),'float32')
    prof=gaussian_filter(r.standard_normal(720),3,mode='wrap');prof=(prof-prof.min())/(prof.max()-prof.min())
    idx=((th+np.pi)/(2*np.pi)*719).astype(int);a=(rad<.13+.14*prof[idx]**2).astype('float32')
    im=Image.fromarray((a*255).astype('uint8'));d=ImageDraw.Draw(im)
    for _ in range(n):
        t=r.uniform(0,6.28);l=(.16+r.exponential(.1))*S;b=max(1.2,r.exponential(5))
        d.ellipse((c+np.cos(t)*l-b,c+np.sin(t)*l-b,c+np.cos(t)*l+b,c+np.sin(t)*l+b),fill=255)
    a=ink(np.asarray(im,dtype='float32')/255,name,rough=2.4,dry=.2,bleed=.6);save(a,name,ss=1)
def bolt(name,W=900,H=520,seed=9):
    """黑闪：黑色锯齿电弧 + 红色外晕"""
    r=rng(seed);im=Image.new('L',(W,H),0);d=ImageDraw.Draw(im)
    def arc(x,y,t,l,wd,dep):
        px,py=x,y
        for i in range(int(l)):
            t+=r.normal(0,.55);s=r.uniform(16,46);nx,ny=px+np.cos(t)*s,py+np.sin(t)*s*.8
            d.line((px,py,nx,ny),fill=255,width=max(1,int(wd*(1-i/l)+1)));px,py=nx,ny
            if dep and r.uniform()<.26:arc(px,py,t+r.choice([-1,1])*r.uniform(.5,1.2),l*.45,wd*.55,dep-1)
    for _ in range(4):arc(W/2+r.normal(0,30),H/2+r.normal(0,20),r.uniform(0,6.28),r.integers(9,15),11,2)
    core=np.asarray(im,dtype='float32')/255;core=gaussian_filter(core,.7);core=(core>.3).astype('float32')
    glow=np.clip(gaussian_filter(core,7)*4.5+gaussian_filter(core,2.5),0,1)
    rgb=np.zeros((H,W,3));rgb[...,0]=214*(1-core);rgb[...,1]=16*(1-core);rgb[...,2]=27*(1-core);rgba_save(rgb,np.maximum(glow,core),name,quality=80)
def rope(name,W=260,H=86,seed=10):
    """注连绳：斜纹绳 + 锯齿纸垂（线稿，可随模式换色）"""
    S=2;im=Image.new('L',(W*S,H*S),0);d=ImageDraw.Draw(im);y0=24*S;h=15*S
    d.line((0,y0-h,W*S,y0-h),fill=255,width=3*S);d.line((0,y0+h,W*S,y0+h),fill=255,width=3*S)
    for x in range(-40,W*S+40,17*S):d.line((x,y0+h,x+22*S,y0-h),fill=255,width=3*S)
    for cx in (W*S//2,):
        z=[(cx-9*S,y0+h),(cx+9*S,y0+h),(cx+9*S,y0+h+10*S),(cx+18*S,y0+h+10*S),(cx+18*S,y0+h+22*S),(cx+9*S,y0+h+22*S),(cx+9*S,y0+h+34*S),(cx,y0+h+34*S),(cx,y0+h+22*S),(cx-9*S,y0+h+22*S),(cx-9*S,y0+h+10*S),(cx-9*S,y0+h)]
        d.line(z,fill=255,width=3*S)
    a=ink(np.asarray(im,dtype='float32')/255,name,rough=1.4,dry=.35,bleed=.5);save(a,name,ss=S)
def eye(name,S=300,seed=11):
    """咒眼：潦草的墨线眼"""
    r=rng(seed);im=Image.new('L',(S*2,S*2),0);d=ImageDraw.Draw(im);c=S
    for k in range(5):
        j=lambda:r.uniform(-9,9)
        pts=[(c-230+j(),c+j()),(c-120+j(),c-92+j()),(c+j(),c-122+j()),(c+120+j(),c-82+j()),(c+230+j(),c+j()),(c+110+j(),c+84+j()),(c+j(),c+106+j()),(c-120+j(),c+80+j()),(c-230+j(),c+j())]
        d.line(pts,fill=255,width=7,joint='curve')
    d.ellipse((c-74,c-74,c+74,c+74),fill=255);d.ellipse((c-18,c-52,c+6,c-28),fill=0)
    for _ in range(26):
        t=r.uniform(3.4,6.0);a=(c+np.cos(t)*238,c+np.sin(t)*128);d.line((a[0],a[1],a[0]+np.cos(t)*r.uniform(16,60),a[1]+np.sin(t)*r.uniform(16,60)),fill=255,width=4)
    a=ink(np.asarray(im,dtype='float32')/255,name,rough=2.4,dry=.35,bleed=.6,splat=20);save(a,name,ss=2)
def wipe(name,W=1600,H=120,seed=12):
    """转场遮罩：左实右空，交界是干笔撕边"""
    r=rng(seed);yy,xx=np.mgrid[0:H,0:W];n=noise(H,W,3,r,ax=30);a=((xx/W-.5)*5<(n-.5)*2.6).astype('float32');a=gaussian_filter(a,.8);save(a,name,ss=1)
def talisman(name,text,ch,seed,W=170,H=620):
    """符：纸 + 墨字 + 红印 + 咒纹"""
    S=2;r=rng(seed);w,h=W*S,H*S;yy,xx=np.mgrid[0:h,0:w]
    pap=np.ones((h,w,3))*np.array([240,233,214])+(noise(h,w,3,r)-.5)[...,None]*30
    alpha=np.ones((h,w),'float32');n=noise(h,w,8,r)
    margin=8+18*noise(h,w,14,r,ax=.3);alpha*=(xx>margin)&(xx<w-margin*.7)
    alpha*=(yy>10+30*noise(h,w,20,r,ax=3))&(yy<h-14-44*noise(h,w,16,r,ax=.7))
    # 文字
    m=lines_mask([text],ch,int(w*.58),vertical=True,stroke=3,jitter=.02,seed=seed,pad=.08)
    m=ink(m,name+'t',rough=2.4,dry=.75,splat=18)
    ty=int(h*.15);th=min(m.shape[0],h-ty);tw=m.shape[1];tx=(w-tw)//2
    bl=np.zeros((h,w),'float32');y1=ty;x1=max(tx,0);sub=m[:th,:min(tw,w-x1)];bl[y1:y1+sub.shape[0],x1:x1+sub.shape[1]]=sub
    # 顶部咒纹
    im=Image.new('L',(w,h),0);d=ImageDraw.Draw(im)
    x,y=w/2,h*.03;pts=[]
    for i in range(16):pts.append((w/2+np.sin(i*1.5)*w*.27*(1-i/28),h*.03+i*h*.0068))
    d.line(pts,fill=255,width=7);d.line([(w*.2,h*.135),(w*.8,h*.128)],fill=255,width=8)
    sc=ink(np.asarray(im,dtype='float32')/255,name+'s',rough=2,dry=.5)
    # 红印
    im=Image.new('L',(w,h),0);d=ImageDraw.Draw(im);cx,cy=w/2,h*.885;R=w*.2
    d.ellipse((cx-R,cy-R,cx+R,cy+R),outline=255,width=9)
    f=ImageFont.truetype(pick('封',ch)[0],int(R*1.25),index=pick('封',ch)[1]);d.text((cx,cy),'封',font=f,fill=255,anchor='mm')
    se=ink(np.asarray(im,dtype='float32')/255,name+'r',rough=2,dry=.8)
    rgb=pap.copy()
    k=np.maximum(bl,sc)[...,None];rgb=rgb*(1-k)+np.array([14,12,10])*k
    k=se[...,None];rgb=rgb*(1-k)+np.array([200,20,28])*k
    alpha=gaussian_filter(alpha.astype('float32'),.8)
    rgba_save(rgb,alpha,name,ss=S,quality=78)
def stamp(name,text,ch,S=380,seed=13,col=(205,18,28),square=True):
    r=rng(seed);im=Image.new('L',(S,S),0);d=ImageDraw.Draw(im);p=22
    if square:d.rounded_rectangle((p,p,S-p,S-p),radius=16,outline=255,width=16)
    else:d.ellipse((p,p,S-p,S-p),outline=255,width=16)
    pk=pick(text[0],ch);n=len(text);sz=int((S-2*p-36)*(.8 if n==1 else 1/n*1.12))
    f=ImageFont.truetype(pk[0],sz,index=pk[1])
    d.text((S/2,S/2),text,font=f,fill=255,anchor='mm',stroke_width=2,stroke_fill=255)
    a=ink(np.asarray(im,dtype='float32')/255,name,rough=2.6,dry=1,bleed=.6);rgb=np.ones((S,S,3))*np.array(col);rgba_save(rgb,a,name,quality=82)
def need(p):return FORCE or not os.path.exists(os.path.join(OUT,p))
FORCE='--force' in sys.argv
def main():
    import plan
    os.makedirs(OUT,exist_ok=True)
    WB=chain('WeibeiSC-Bold.otf','WeibeiTC-Bold.otf','Kaiti.ttc','Songti.ttc','STHeiti Medium.ttc','Arial Unicode.ttf')
    XK=chain('Xingkai.ttc','WeibeiTC-Bold.otf','WeibeiSC-Bold.otf','Kaiti.ttc','Songti.ttc','Arial Unicode.ttf')
    LAT=chain('Arial Black.ttf','Arial Bold.ttf','Arial Unicode.ttf')
    if need('paper.webp'):paper('paper.webp',(241,238,229),3.2,5);paper('paper_neg.webp',(14,13,12),2.2,3)
    for fn,f,a in (('speed.webp',speed,{}),('speed2.webp',speed,dict(cx=.5,cy=.5,n=520,void=.17,seed=21)),('edge.webp',edge,{}),('flame.webp',flame,{}),('enso.webp',enso,{}),('swath.webp',swath,{}),('swath2.webp',swath,dict(seed=25)),('hatch.webp',hatch,{}),('splat.webp',splats,{}),('splat2.webp',splats,dict(seed=28,n=110)),('bolt.webp',bolt,{}),('rope.webp',rope,{}),('eye.webp',eye,{}),('wipe.webp',wipe,{})):
        if need(fn):f(fn,**a)
    for fn,col,R in (('frame_k.webp',(11,11,11),0),('frame_w.webp',(243,241,234),0),('frame_r.webp',(214,16,27),0),('frame_b.webp',(18,65,196),0),('bubble_k.webp',(11,11,11),44),('bubble_w.webp',(243,241,234),44)):
        if need(fn):frame(fn,col,R=R,seed=fn)
    for e in plan.EPS:
        if need(f't/{e["id"]}.webp'):
            m=lines_mask(wrap(e['title']),WB,190,stroke=3,seed=e['id'],latin=LAT);save(ink(m,'t'+e['id'],rough=2.6,dry=.85,splat=30),f't/{e["id"]}.webp',ss=2)
        if need(f'k/{e["id"]}.webp'):
            m=lines_mask([e['kanji']],XK,900,stroke=9,lean=0,seed=e['id'],pad=.1);save(ink(m,'k'+e['id'],rough=6,dry=1,splat=70),f'k/{e["id"]}.webp',ss=2)
    for v,info in plan.VOLS.items():
        short=info['title'].split('｜')[0]
        if need(f'v/{v}.webp'):
            m=lines_mask([short],WB,150,stroke=3,seed=v,latin=LAT);save(ink(m,f'v{v}',rough=2.4,dry=.85,splat=16),f'v/{v}.webp',ss=2)
        if need(f'vs/{v}.webp'):
            m=lines_mask([info['name'].replace('卷','巻')+'　'+short[:8]],WB,120,vertical=True,stroke=2,seed=v,pad=.1,latin=LAT);save(ink(m,f'vs{v}',rough=2,dry=.8),f'vs/{v}.webp',ss=2)
    for k,t in dict(shu='術式',trap='咒靈',flash='黑閃',vow='束縛',link='因果',ana='比方',domain='領域展開',sensei='師',real='實戰').items():
        if need(f'l/{k}.webp'):
            m=lines_mask([t],XK,190,vertical=k not in('flash','domain','real'),stroke=5,seed=k,lean=-.1 if k in('flash','domain','real') else 0,pad=.12);save(ink(m,'l'+k,rough=3,dry=.85,splat=14),f'l/{k}.webp',ss=2)
    if need('hero.webp'):
        m=lines_mask(['術式'],XK,560,stroke=12,lean=-.1,jitter=.03,seed=1,pad=.14);save(ink(m,'hero',rough=5,dry=1,splat=120),'hero.webp',ss=2)
    if need('hero408.webp'):
        m=lines_mask(['408'],chain('Arial Black.ttf','Arial Unicode.ttf'),300,stroke=4,lean=-.16,seed=2,pad=.12);a=ink(m,'h408',rough=4,dry=1,splat=46);rgb=np.ones(a.shape+(3,))*np.array([214,16,27]);rgba_save(rgb,a,'hero408.webp',ss=2)
    for i,t in enumerate(('數據結構','計組原理','操作系統','計算機網絡')):
        if need(f'fu{i}.webp'):talisman(f'fu{i}.webp',t,XK,seed=i+40,H=(620 if len(t)==4 else 740))
    for k,t in dict(shu='術式錄',trap='咒靈錄',link='因果錄',wrong='錯題',syl='考綱對照').items():
        if need(f'p/{k}.webp'):
            m=lines_mask([t],WB,190,stroke=3,seed=k,latin=LAT);save(ink(m,'p'+k,rough=2.6,dry=.85,splat=30),f'p/{k}.webp',ss=2)
    if need('seal.webp'):stamp('seal.webp','読',XK,square=False)
    if need('seal_ok.webp'):stamp('seal_ok.webp','祓',XK,S=300,seed=33)
    print('ink ok',sum(os.path.getsize(os.path.join(d,f)) for d,_,fs in os.walk(OUT) for f in fs)//1024,'KB')
if __name__=='__main__':main()
