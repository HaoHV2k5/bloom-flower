import { useRef, useState, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight, ArrowDown, Flower2, Heart } from 'lucide-react';
import './EncouragementTimeline.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const PHOTOS = {
  'sunset-garden': { file: 'sunset-garden.png', width: 1080, height: 814, landscape: true },
  'little-joy': { file: 'little-joy.jpg', width: 1080, height: 1432 },
  sunflowers: { file: 'sunflowers.jpg', width: 1080, height: 1423, sideways: true, landscape: true },
  'blue-butterfly': { file: 'blue-butterfly.jpg', width: 1080, height: 1451, sideways: true, landscape: true },
  'in-bloom': { file: 'in-bloom.jpg', width: 1080, height: 815, landscape: true },
};
const INTRO_PHOTO = { photo: 'sunset-garden', caption: 'Một khoảng trời yên, em gửi chị.', alt: 'Vườn hướng dương dưới bầu trời hoàng hôn dịu nhẹ' };
const CHAPTERS = [
  { id: 'these-days', label: 'Em thấy mà', title: 'Chị giỏi hơn chị nghĩ đấy.', text: 'Dạo này đồ án có thể khiến chị chỉ nhìn thấy những việc chưa xong. Em thấy một người vẫn kiên nhẫn thử, sửa, rồi tìm cách đi tiếp. Đừng để một hôm chưa thuận lợi làm chị quên bao nhiêu chuyện mình đã từng vượt qua.', note: 'Em có thiên vị chị một chút. Nhưng chị đáng được tự hào thật.', caption: 'Em xin phép giữ lại khoảnh khắc dễ thương này.', photo: 'little-joy', alt: 'Chị cầm chiếc kính giữa những ánh đèn buổi tối' },
  { id: 'a-gentle-note', label: 'Một lối đi khác', title: 'Đi đường vòng vẫn tới nơi.', text: 'Không phải điều gì tốt đẹp cũng đến theo đường thẳng. Có những lần làm lại giúp mình tìm ra một cách hay hơn; có những bước chậm để biết điều gì thật sự đáng theo đuổi. Chị chưa cần có hết câu trả lời để bắt đầu bước kế tiếp.', note: 'Đi đường vòng cũng được. Biết đâu lại gặp một quán ngon.' },
  { id: 'little-by-little', label: 'Theo nhịp của chị', title: 'Không cần nở cùng lúc với ai.', text: 'Vườn hoa đẹp vì chẳng bông nào phải giống bông nào. Chị cũng có một nhịp riêng, những điều thích riêng và những ước mơ rất đáng giữ. Cứ dành sức cho điều khiến mắt mình sáng lên. Đi chậm hơn ai đó không có nghĩa là mình đang đi sai.', note: 'Hoa thì hướng nắng. Em thì hay hướng về chị.', caption: 'Chị cứ lớn lên theo cách của chị.', photo: 'sunflowers', alt: 'Chị mỉm cười, giơ tay chữ V giữa vườn hướng dương' },
  { id: 'right-here', label: 'Có em ở đây', title: 'Hôm nay chị muốn kể gì?', text: 'Một chuyện khiến chị vui, một điều đang mong, hay một ngày chẳng biết gọi tên cảm xúc. Em có thể không nghĩ ra câu trả lời thật hay, nhưng em muốn nghe cả những chuyện bé xíu của chị. Không cần đợi có tin tốt mới nhắn cho em đâu.', note: 'Kỹ năng chọc chị cười: đang luyện. Độ sẵn lòng nghe: có sẵn.', caption: 'Em thích nụ cười này. Vậy thôi.', photo: 'blue-butterfly', alt: 'Chị mỉm cười bên đôi cánh bướm xanh phát sáng' },
  { id: 'in-bloom', label: 'Những điều đáng mong', title: 'Còn nhiều ngày đẹp đang chờ.', text: 'Một buổi chiều đi ngắm hoa. Một món ngon tình cờ tìm được. Một nơi chị muốn tới từ lâu. Cuộc sống vẫn còn nhiều điều chưa kịp làm mình háo hức. Em mong chị giữ chỗ cho những điều ấy — và nếu được, giữ cho em một chỗ đi cùng.', note: 'Sau này nhìn lại, mong chị nhớ cả những lần mình đã vui.', caption: 'Hẹn chị một hôm. Chỉ ngắm hoa, không vội.', photo: 'in-bloom', alt: 'Chị trong chiếc váy xanh giữa vườn hoa hồng tím' },
];

function MemoryPhoto({ chapter, eager = false, className = '' }) {
  const photo = PHOTOS[chapter.photo];
  return <figure className={`memory-photo ${photo.landscape ? 'memory-photo--landscape' : 'memory-photo--portrait'} ${className}`}>
    <div className={`memory-window${photo.sideways ? ' memory-window--sideways' : ''}`}>
      <img src={`${import.meta.env.BASE_URL}assets/encouragement/${photo.file}`} alt={chapter.alt} width={photo.width} height={photo.height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
    <figcaption>{chapter.caption}</figcaption>
  </figure>;
}

export default function EncouragementTimeline({ onComplete, onBack, paused, reducedMotion, playSound }) {
  const root = useRef(null);
  const rail = useRef(null);
  const sceneAnimations = useRef([]);
  const [active, setActive] = useState(0);
  const shouldAnimate = !paused && !reducedMotion;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    root.current.querySelector('h1')?.focus({ preventScroll: true });
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) setActive(Number(visible[0].target.dataset.chapter));
    }, { rootMargin: '-20% 0px -35% 0px', threshold: [0, .15, .4] });
    root.current.querySelectorAll('.timeline-chapter').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useGSAP(() => {
    sceneAnimations.current = [];
    if (!shouldAnimate) return;
    const intro = gsap.timeline({ defaults: { ease: 'expo.out' } })
      .from('.journey-intro-title', { y: 22, autoAlpha: 0, duration: .85 }, 0)
      .from('.journey-intro-copy, .journey-start, .journey-unhurried', { y: 12, autoAlpha: 0, duration: .65, stagger: .12 }, .2)
      .from('.journey-cover-photo', { rotation: -6, y: 30, scale: .96, autoAlpha: 0, duration: 1.1 }, .1)
      .from('.journey-cover-flower', { scale: 0, rotation: -100, duration: .85 }, .55)
      .from('.journey-cover-note', { autoAlpha: 0, y: 8, duration: .6 }, .75);
    sceneAnimations.current.push(intro);
    gsap.fromTo(rail.current, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline-chapters', start: 'top 60%', end: 'bottom 60%', scrub: .4 } });
    root.current.querySelectorAll('.timeline-chapter').forEach(section => {
      const entrance = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: { trigger: section, start: 'top 78%', once: true } });
      entrance.from(section.querySelectorAll('.timeline-message > *'), { y: 18, autoAlpha: 0, duration: .7, stagger: .12 }, 0);
      const photo = section.querySelector('.memory-photo');
      if (photo) {
        entrance.from(photo, { y: 32, rotation: Number(section.dataset.chapter) % 2 ? -5 : 5, scale: .96, duration: 1 }, .1)
          .from(photo.querySelector('.memory-window'), { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'power2.inOut' }, .15)
          .from(photo.querySelector('figcaption'), { autoAlpha: 0, y: 7, duration: .5 }, .7);
      } else {
        entrance.from(section.querySelector('.journey-keepsake'), { y: 28, rotation: -5, autoAlpha: 0, duration: .9 }, .2)
          .from(section.querySelector('.keepsake-flower'), { scale: .25, rotation: -60, duration: .8 }, .6);
      }
      sceneAnimations.current.push(entrance);
    });
    const refresh = () => ScrollTrigger.refresh();
    const images = [...root.current.querySelectorAll('img')];
    images.forEach(img => img.addEventListener('load', refresh));
    let mounted = true;
    document.fonts.ready.then(() => { if (mounted) refresh(); });
    return () => { mounted = false; images.forEach(img => img.removeEventListener('load', refresh)); };
  }, { scope: root, dependencies: [shouldAnimate], revertOnUpdate: true });

  useEffect(() => {
    const sync = () => sceneAnimations.current.forEach(animation => animation.paused(document.hidden));
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  function jumpTo(id) {
    playSound('page');
    document.getElementById(id)?.scrollIntoView({ behavior: shouldAnimate ? 'smooth' : 'instant', block: 'start' });
  }
  return <main className={`encouragement-journey${shouldAnimate ? ' journey-has-motion' : ''}`} ref={root}>
    <div className="journey-top"><button type="button" onClick={onBack}><ArrowLeft size={16} aria-hidden="true" /> Về lời mời</button><span>Gửi chị Huyền Trang, với một chút thương.</span></div>
    <section className="journey-intro" aria-labelledby="journey-title">
      <div className="journey-intro-text">
        <h1 id="journey-title" className="journey-intro-title" tabIndex={-1}>Chị cứ bước tiếp.<br /><em>Em lo phần cổ vũ.</em></h1>
        <p className="journey-intro-copy">Chị cho em xin vài phút nhé.<br className="journey-desktop-break" /> Không có câu hỏi khó ở đây,<br className="journey-desktop-break" /> chỉ có một người đang rất muốn chị cười.</p>
        <button type="button" className="journey-start" onClick={() => jumpTo(CHAPTERS[0].id)}>Đọc cùng em nhé <ArrowDown size={17} aria-hidden="true" /></button>
        <p className="journey-unhurried">Cứ đọc chậm thôi. Em còn nhiều điều muốn kể.</p>
      </div>
      <div className="journey-cover" aria-hidden="true">
        <MemoryPhoto chapter={INTRO_PHOTO} eager className="journey-cover-photo" />
        <span className="journey-cover-note">Nắng sắp về rồi.<br />Chị cứ đi tiếp nhé.</span>
        <Flower2 className="journey-cover-flower" size={62} strokeWidth={.8} />
      </div>
    </section>
    <div className="journey-reading-layout">
      <nav className="journey-index" aria-label="Các chặng lời nhắn">
        <p>Một lời nhắn, từng chút một.</p>
        <ol>{CHAPTERS.map((chapter, i) => <li key={chapter.id}><a href={`#${chapter.id}`} aria-current={active === i ? 'step' : undefined} onClick={event => { event.preventDefault(); jumpTo(chapter.id); }}><span className="journey-index-dot" aria-hidden="true" />{chapter.label}</a></li>)}</ol>
        <Flower2 size={25} strokeWidth={1} aria-hidden="true" />
      </nav>
      <div className="timeline-chapters">
        <div className="journey-rail" aria-hidden="true"><span ref={rail} /></div>
        {CHAPTERS.map((chapter, i) => <section className={`timeline-chapter timeline-chapter--${i + 1}${active >= i ? ' is-reached' : ''}`} key={chapter.id} id={chapter.id} data-chapter={i} aria-labelledby={`${chapter.id}-title`}>
          <div className="timeline-marker" aria-hidden="true"><span /><Flower2 size={23} strokeWidth={1.2} /></div>
          <div className="timeline-message">
            <span className="timeline-position">{chapter.label}</span>
            <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
            <p className="timeline-body">{chapter.text}</p>
            <p className="timeline-note">{chapter.note}</p>
          </div>
          {chapter.photo ? <MemoryPhoto chapter={chapter} /> : <aside className="journey-keepsake" aria-label="Một tấm thiệp nhỏ em gửi chị">
            <span className="keepsake-tape" aria-hidden="true" />
            <Flower2 className="keepsake-flower" size={42} strokeWidth={1} aria-hidden="true" />
            <p className="keepsake-quote">Chậm một chút,<br />vẫn có thể<br /><em>đi rất xa.</em></p>
            <span className="keepsake-divider" aria-hidden="true"><Heart size={13} strokeWidth={1} /></span>
            <p className="keepsake-signature">Em tin vào những bước nhỏ ấy.</p>
          </aside>}


        </section>)}
      </div>
    </div>
    <section className="journey-ending" aria-labelledby="journey-ending-title">
      <Heart size={25} strokeWidth={1} aria-hidden="true" />
      <h2 id="journey-ending-title">Chuyện đẹp còn ở phía trước.<br /><em>Em muốn đi cùng chị.</em></h2>
      <p>Em còn một món quà nhỏ chưa đưa.<br />Chị mở tiếp nhé, em hồi hộp từ nãy giờ rồi.</p>
      <button type="button" className="journey-gift" onClick={onComplete}>Mở món quà nhỏ <ArrowRight size={18} aria-hidden="true" /></button>
      <button type="button" className="journey-reread" onClick={() => jumpTo('journey-title')}>Đọc lại từ đầu</button>
    </section>
  </main>;
}
