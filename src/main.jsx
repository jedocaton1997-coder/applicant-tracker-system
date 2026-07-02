import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'


function Icon({ name='spark', size=28, className='' }) {
  const common = { width:size, height:size, viewBox:'0 0 24 24', fill:'none', stroke:'currentColor', strokeWidth:1.9, strokeLinecap:'round', strokeLinejoin:'round', className, 'aria-hidden':true }
  const paths = {
    spark:<><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z"/></>,
    play:<><path d="M8 5v14l11-7-11-7z" fill="currentColor" stroke="none"/></>,
    playbox:<><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M9 2l3 4 3-4"/><path d="M10 10v7l6-3.5-6-3.5z"/></>,
    clap:<><path d="M4 11h16v9H4z"/><path d="M5 11l13-6 2 4-13 6"/><path d="M8 9l2 4M13 7l2 4"/><path d="M10 15v3l4-1.5L10 15z"/></>,
    layers:<><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 16l9 5 9-5"/></>,
    lock:<><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></>,
    wand:<><path d="M15 4l5 5M4 20l10-10"/><path d="M14 4l6 6"/><path d="M5 4l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"/></>,
    eye:<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/></>,
    users:<><path d="M16 21v-2a4 4 0 00-8 0v2"/><circle cx="12" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></>
  }
  return <svg {...common}>{paths[name] || paths.spark}</svg>
}

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=85`

function CTAButton({ children, variant = 'primary' }) {
  return <a className={`cta ${variant}`} href="#contact">{children}<span aria-hidden>→</span></a>
}

function Header() {
  return <header className="header">
    <a className="logo" href="#top" aria-label="Bangzuu Studios home"><span className="mark">B</span><span>Bangzuu <b>Studios</b></span></a>
    <nav aria-label="Primary navigation"><a href="#work">Work</a><a href="#services">Services</a><a href="#studio">Studio</a><a href="#contact">Contact</a></nav>
    <CTAButton>Get in touch</CTAButton>
  </header>
}

function ImageCard({ className='', src, alt, children }) {
  return <article className={`image-card ${className}`}><img src={src} alt={alt}/><div className="shade" />{children}</article>
}

function HeroVisual() {
  return <div className="hero-visual float" id="work" aria-label="Cinematic travel story collage">
    <ImageCard className="main-dest" src={img('photo-1507525428034-b723cf961d3e')} alt="Turquoise tropical lagoon at sunset"><button className="play" aria-label="Play hero film"><Icon name="play" size={18}/></button></ImageCard>
    <ImageCard className="episode" src={img('photo-1571896349842-33c89424de2d')} alt="Luxury resort pool glowing at night"><div className="caption"><small>EPISODE 03</small><strong>The Arrival</strong><em>9:24</em></div></ImageCard>
    <ImageCard className="window" src={img('photo-1436491865332-7a61a109cc05')} alt="Airplane window view over clouds at purple sunset" />
    <ImageCard className="story" src={img('photo-1533105079780-92b9be482077')} alt="Traveler overlooking a Mediterranean village at sunset"><div className="caption"><small>A STORY WORLD</small><strong>Your Brand. Our Universe.</strong></div><Icon name="spark" className="corner" size={24}/></ImageCard>
    <ImageCard className="cruise" src={img('photo-1548574505-5e239809ee19')} alt="Cruise ship sailing at dusk" />
    <ImageCard className="strip" src={img('photo-1500530855697-b586d89ba3ee')} alt="Overwater bungalows on a cinematic island"><span className="pill"><Icon name="spark" size={15}/>7 EPISODES</span></ImageCard>
  </div>
}

function HeroSection() {
  return <section className="hero" id="top"><div className="hero-copy reveal"><p className="eyebrow">AI-native film studio for travel & hospitality</p><h1>Turn your travel brand into a <em>story people follow.</em></h1><p className="sub">Bangzuu Studios creates AI-made mini-movies, microdramas, and cinematic campaigns for destinations, hotels, resorts, cruise lines, airlines, booking platforms, and travel brands.</p><p className="support">Not ads squeezed into someone else’s content. <span>Original stories built around your brand.</span></p><div className="actions"><CTAButton>Get in touch</CTAButton><CTAButton variant="ghost">View work</CTAButton></div></div><HeroVisual /></section>
}

const services = [
  ['clap', 'Mini-Movies', 'Cinematic branded films with an actual plot.'],
  ['playbox', 'Microdramas', 'Short, episodic stories designed to make the next episode impossible to ignore.'],
  ['layers', 'Campaign Systems', 'One central story developed across every format and platform.']
]
function ServiceCards(){return <section className="services reveal" id="services">{services.map(([icon,title,desc])=><article className="service" key={title}><Icon name={icon}/><div><h2>{title}</h2><p>{desc}</p></div></article>)}</section>}

function StoryWorldCard(){const eps=['The Invitation','The Detour','The Choice','Coming Soon'];return <aside className="story-card"><div className="dashboard"><ImageCard className="postcard" src={img('photo-1516483638261-f4dbaf036963')} alt="Mediterranean coastal road at sunset"><span className="badge"><Icon name="spark" size={15}/>Original IP</span><div className="title"><small>The Adriatic</small><h3>Beyond<br/>the Postcard</h3><p>An original series by your brand</p></div></ImageCard><div className="episode-list">{eps.map((e,i)=><ImageCard key={e} className="mini-ep" src={img(['photo-1500530855697-b586d89ba3ee','photo-1464822759023-fed622ff2c3b','photo-1528127269322-539801943592','photo-1519046904884-53103b34b206'][i])} alt={`${e} episode thumbnail`}><div><small>EP 0{i+1}</small><strong>{e}</strong></div>{i===3&&<Icon name="lock" size={18}/>}</ImageCard>)}</div></div><div className="benefits">{[['wand','Owned Story World','Your IP. Your Audience.'],['layers','Multi-Platform Assets','Built once. Scaled everywhere.'],['play','Long-Term Value','Stories that keep working.']].map(([i,t,d])=><div key={t}><Icon name={i}/><span><b>{t}</b><small>{d}</small></span></div>)}</div><div className="pills"><span><Icon name="spark" size={15}/>One Story</span><span><Icon name="spark" size={15}/>Many Formats</span><span><Icon name="spark" size={15}/>Endless Journeys</span></div></aside>}

function OldModelSection(){const pts=[['play','People skip the ad before the message lands.'],['eye','You borrow attention inside someone else’s story.'],['users','They keep the audience. You keep the impressions.'],['spark','Bangzuu Studio builds original story worlds your brand can own.']];return <section className="old-model reveal" id="studio"><div className="problem"><p className="eyebrow">The old model is broken</p><h2>Stop buying sponsor reads. <em>Start owning the story.</em></h2><div className="points">{pts.map(([ic,t],i)=><div className={i===3?'hot':''} key={t}><Icon name={ic}/><p>{t}</p></div>)}</div><p className="closing">Stop renting attention.<br/>Own the content people return for.</p></div><StoryWorldCard/></section>}

function App(){return <><main><Header/><HeroSection/><ServiceCards/><OldModelSection/><section id="contact" className="final reveal"><p className="eyebrow">Build the next destination universe</p><h2>Ready to make your brand binge-worthy?</h2><CTAButton>Get in touch</CTAButton></section></main></>}

createRoot(document.getElementById('root')).render(<App />)
