import numpy as np, wave
SR=48000; FPS=24; N=SR*10
t=np.arange(N)/SR
out=np.zeros(N)
rng=np.random.default_rng(7)
noise=rng.standard_normal(N)

def F(f): return f/FPS               # frame -> seconds
def seg(a,b): 
    i=int(a*SR); j=int(b*SR); return slice(i,j), t[i:j]-a
def env(n,att,rel,length):
    e=np.ones(n); a=int(att*SR); r=int(rel*SR)
    if a>0: e[:a]=np.linspace(0,1,a)
    if r>0 and r<n: e[-r:]*=np.linspace(1,0,r)
    return e
def lowpass(x,fc):
    # one pole
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); z=0.0
    for i in range(len(x)):
        z=a*z+(1-a)*x[i]; y[i]=z
    return y
def highpass(x,fc): return x-lowpass(x,fc)
def add(a,b,sig): 
    s,_=seg(a,b); n=len(out[s]); out[s]+=sig[:n]
def drone(a,b,f,amp,att=0.05,rel=0.08):
    s,tt=seg(a,b)
    sig=np.sin(2*np.pi*f*tt)+0.45*np.sin(2*np.pi*f*2*tt+0.3)+0.2*np.sin(2*np.pi*f*1.003*tt)
    add(a,b,amp*sig*env(len(tt),att,rel,b-a))
def hit(a,f,amp,dur=0.45,clip=False):
    s,tt=seg(a,a+dur)
    sig=np.sin(2*np.pi*(f*np.exp(-tt*3))*tt)*np.exp(-tt*7)
    if clip: sig=np.tanh(sig*4)
    add(a,a+dur,amp*sig)
def burst(a,dur,amp,fc_lo=None,fc_hi=None,tone=None):
    s,tt=seg(a,a+dur); n=len(tt)
    sig=noise[s].copy()
    if fc_hi: sig=lowpass(sig,fc_hi)
    if fc_lo: sig=highpass(sig,fc_lo)
    if tone: sig+=0.8*np.sin(2*np.pi*tone*tt)
    add(a,a+dur,amp*sig*np.exp(-tt*(6/dur)))
def bed(a,b,amp,fc_hi=None,fc_lo=None,att=0.05,rel=0.05):
    s,tt=seg(a,b); sig=noise[s].copy()
    if fc_hi: sig=lowpass(sig,fc_hi)
    if fc_lo: sig=highpass(sig,fc_lo)
    add(a,b,amp*sig*env(len(tt),att,rel,b-a))
def chirp(a,dur,f0,f1,amp):
    s,tt=seg(a,a+dur); ph=2*np.pi*(f0*tt+(f1-f0)*tt**2/(2*dur))
    add(a,a+dur,amp*np.sin(ph)*env(len(tt),0.01,0.03,dur))

# --- shot 1: hit, drone, air rush
hit(0.0,58,0.95,0.6)
drone(0.0,F(81),73.42,0.22,0.02,0.15)
s,tt=seg(0,F(29)); add(0,F(29),0.28*lowpass(noise[s],900)*np.linspace(0.2,1,len(tt))**1.5)
# --- shot 2: room tone, click at f44
bed(F(29),F(58),0.035,fc_hi=400)
drone(F(29),F(58),73.42*2,0.02)         # monitor whine, faint
burst(F(44),0.012,0.5,fc_lo=1500)
# --- shot 3: fluorescent buzz, muffled laughter (low passed noise chatter)
s,tt=seg(F(58),F(82)); add(F(58),F(82),0.06*np.sign(np.sin(2*np.pi*120*tt))*(0.7+0.3*np.sin(2*np.pi*3*tt)))
s,tt=seg(F(58),F(82)); add(F(58),F(82),0.09*lowpass(noise[s]*(0.5+0.5*np.abs(np.sin(2*np.pi*5.5*tt))),700))
# whoosh into whip
s,tt=seg(F(78),F(82)); add(F(78),F(82),0.5*highpass(noise[s],800)*np.linspace(0,1,len(tt))**2)
# --- shot 4: gym, full band
hit(F(82),52,1.0,0.5,clip=True); burst(F(82),0.25,0.6,fc_lo=600,tone=2100)
bed(F(82),F(106),0.16,fc_hi=6000,att=0.01,rel=0.02)
burst(F(88),0.18,0.3,fc_lo=300)                       # breath
hit(F(96),52,0.9,0.45,clip=True); burst(F(97),0.2,0.5,fc_lo=800,tone=1700)
# --- shot 5: near silence, distant crowd, wind, whistle
bed(F(106),F(130),0.03,fc_hi=350,att=0.2,rel=0.2)
bed(F(106),F(130),0.02,fc_lo=2500,att=0.3,rel=0.3)
drone(F(106),F(158),73.42,0.06,0.4,0.2)
chirp(F(118),0.14,2450,2400,0.12)
# --- shot 6: accelerating ticks, sent whooshes rising a semitone each, no chime
a=F(130); iv=0.24; k=0
while a<F(157):
    burst(a,0.004,0.35,fc_lo=2000); a+=iv; iv=max(0.05,iv*0.86); k+=1
for i in range(9):
    a=F(130)+i*(F(157)-F(130))/9.5; f0=600*2**(i/12)
    chirp(a,0.07,f0,f0*2.2,0.10); burst(a,0.05,0.08,fc_lo=1500)
# --- shot 7: metal slide, clack, then room tone
s,tt=seg(F(158),F(163)); add(F(158),F(163),0.35*highpass(lowpass(noise[s],5000),1500)*env(len(tt),0.02,0.02,F(5)))
burst(F(163),0.05,0.8,fc_lo=400,tone=1500); hit(F(163),180,0.4,0.12)
bed(F(164),F(182),0.03,fc_hi=400,att=0.1,rel=0.1)
# --- shot 8: fan hum, keys, the tick
s,tt=seg(F(182),F(211)); add(F(182),F(211),0.05*(np.sin(2*np.pi*100*tt)+0.5*np.sin(2*np.pi*200*tt))*env(len(tt),0.1,0.05,F(29)))
bed(F(182),F(199),0.03,fc_hi=1200)
for i in range(6): burst(F(190)+i*0.055,0.010,0.35,fc_lo=1200,tone=3000+i*150)
# silence gap: carve f199..f202 out of everything so far
out[int(F(199)*SR):int(F(202)*SR)]=0
chirp(F(199),0.025,4200,4000,0.9)
bed(F(203),F(211),0.03,fc_hi=1000,att=0.05)
drone(F(203),F(211),36.71,0.18,0.15,0.02)
# --- shot 9: rush, drone low, arc tone, hard stop, pulse, wind
s,tt=seg(F(211),F(226)); add(F(211),F(226),0.4*lowpass(noise[s],1500)*np.linspace(0.1,1,len(tt))**1.2)
drone(F(211),F(234),36.71,0.32,0.05,0.005)
bed(F(224),F(240),0.05,fc_lo=1800,att=0.3,rel=0.0)
chirp(F(226),F(234)-F(226),440,880,0.14)
hit(F(236),45,0.35,0.2)

out=np.tanh(out*1.1)
# loudness: crude RMS target around -14 LUFS equivalent; ffmpeg loudnorm does the real pass
peak=np.max(np.abs(out)); out=out/peak*0.89
w=wave.open('mix.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close()
print('wav ok', N/SR, 's')
