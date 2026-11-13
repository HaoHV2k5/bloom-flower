import { useEffect, useRef, useState } from 'react';
import './BloomFlower.css';

const EDGE_FLOWERS = [
  { side: 'left-outer', x: '-75cqmin', scale: .58, height: '51cqmin', delay: '1.8s', base: '#b86887', tip: '#eeb4c9' },
  { side: 'left-inner', x: '-45cqmin', scale: .8, height: '54cqmin', delay: '1.1s', base: '#c78b70', tip: '#f1c5ab' },
  { side: 'right-inner', x: '45cqmin', scale: .75, height: '57cqmin', delay: '1.35s', base: '#b77991', tip: '#eac0ce' },
  { side: 'right-outer', x: '75cqmin', scale: .58, height: '48cqmin', delay: '2s', base: '#bc9656', tip: '#f1ddb0' },
];

function EdgeFlowers() {
  return EDGE_FLOWERS.map(({ side, x, scale, height, delay, base, tip }) => <div key={side} className={`garden-sprig garden-sprig--${side}`} style={{ '--sprig-x': x, '--sprig-scale': scale, '--sprig-height': height, '--sprig-delay': delay, '--petal-base': base, '--petal-tip': tip }}>
    <div className="flower flower--1">
      <div className="flower__leafs">
        {[1, 2, 3, 4].map(i => <div key={i} className={`flower__leaf flower__leaf--${i}`} />)}
        <div className="flower__white-circle" />
      </div>
      <div className="flower__line">{[1, 2, 3, 4].map(i => <div key={i} className={`flower__line__leaf flower__line__leaf--${i}`} />)}</div>
    </div>
  </div>);
}

// The original Bloom Flower markup and CSS animations, scoped to this React stage.
// Mounting this component starts the same stem, leaf, grass and petal growth sequence.
export default function BloomFlower({ reducedMotion, paused, expanded = false }) {
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const stage = useRef(null);
  useEffect(() => {
    let secondFrame;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setReady(true));
    });
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
  const classes = ['bloom-canvas', !ready && 'bloom-pending',
    (paused || hidden) && 'bloom-paused', reducedMotion && 'bloom-reduced'].filter(Boolean).join(' ');
  return <div ref={stage} className={`bloom-stage${expanded ? ' bloom-stage--expanded' : ''}`} role="img" aria-label="Khu vườn hoa 3D tự mọc, bung lá và nở hoa hồng, hồng đào, vàng kem trải rộng trên hai trang sách dành cho Huyền Trang">
    <div className={classes}>
<div className="flowers">
    {expanded && <EdgeFlowers />}
    <div className="flower flower--1">
      <div className="flower__leafs flower__leafs--1">
        <div className="flower__leaf flower__leaf--1"></div>
        <div className="flower__leaf flower__leaf--2"></div>
        <div className="flower__leaf flower__leaf--3"></div>
        <div className="flower__leaf flower__leaf--4"></div>
        <div className="flower__white-circle"></div>

        <div className="flower__light flower__light--1"></div>
        <div className="flower__light flower__light--2"></div>
        <div className="flower__light flower__light--3"></div>
        <div className="flower__light flower__light--4"></div>
        <div className="flower__light flower__light--5"></div>
        <div className="flower__light flower__light--6"></div>
        <div className="flower__light flower__light--7"></div>
        <div className="flower__light flower__light--8"></div>

      </div>
      <div className="flower__line">
        <div className="flower__line__leaf flower__line__leaf--1"></div>
        <div className="flower__line__leaf flower__line__leaf--2"></div>
        <div className="flower__line__leaf flower__line__leaf--3"></div>
        <div className="flower__line__leaf flower__line__leaf--4"></div>
        <div className="flower__line__leaf flower__line__leaf--5"></div>
        <div className="flower__line__leaf flower__line__leaf--6"></div>
      </div>
    </div>

    <div className="flower flower--2">
      <div className="flower__leafs flower__leafs--2">
        <div className="flower__leaf flower__leaf--1"></div>
        <div className="flower__leaf flower__leaf--2"></div>
        <div className="flower__leaf flower__leaf--3"></div>
        <div className="flower__leaf flower__leaf--4"></div>
        <div className="flower__white-circle"></div>

        <div className="flower__light flower__light--1"></div>
        <div className="flower__light flower__light--2"></div>
        <div className="flower__light flower__light--3"></div>
        <div className="flower__light flower__light--4"></div>
        <div className="flower__light flower__light--5"></div>
        <div className="flower__light flower__light--6"></div>
        <div className="flower__light flower__light--7"></div>
        <div className="flower__light flower__light--8"></div>

      </div>
      <div className="flower__line">
        <div className="flower__line__leaf flower__line__leaf--1"></div>
        <div className="flower__line__leaf flower__line__leaf--2"></div>
        <div className="flower__line__leaf flower__line__leaf--3"></div>
        <div className="flower__line__leaf flower__line__leaf--4"></div>
      </div>
    </div>

    <div className="flower flower--3">
      <div className="flower__leafs flower__leafs--3">
        <div className="flower__leaf flower__leaf--1"></div>
        <div className="flower__leaf flower__leaf--2"></div>
        <div className="flower__leaf flower__leaf--3"></div>
        <div className="flower__leaf flower__leaf--4"></div>
        <div className="flower__white-circle"></div>

        <div className="flower__light flower__light--1"></div>
        <div className="flower__light flower__light--2"></div>
        <div className="flower__light flower__light--3"></div>
        <div className="flower__light flower__light--4"></div>
        <div className="flower__light flower__light--5"></div>
        <div className="flower__light flower__light--6"></div>
        <div className="flower__light flower__light--7"></div>
        <div className="flower__light flower__light--8"></div>

      </div>
      <div className="flower__line">
        <div className="flower__line__leaf flower__line__leaf--1"></div>
        <div className="flower__line__leaf flower__line__leaf--2"></div>
        <div className="flower__line__leaf flower__line__leaf--3"></div>
        <div className="flower__line__leaf flower__line__leaf--4"></div>
      </div>
    </div>

    <div className="grow-ans" style={{"--d": "1.2s"}}>
      <div className="flower__g-long">
        <div className="flower__g-long__top"></div>
        <div className="flower__g-long__bottom"></div>
      </div>
    </div>

    <div className="growing-grass">
      <div className="flower__grass flower__grass--1">
        <div className="flower__grass--top"></div>
        <div className="flower__grass--bottom"></div>
        <div className="flower__grass__leaf flower__grass__leaf--1"></div>
        <div className="flower__grass__leaf flower__grass__leaf--2"></div>
        <div className="flower__grass__leaf flower__grass__leaf--3"></div>
        <div className="flower__grass__leaf flower__grass__leaf--4"></div>
        <div className="flower__grass__leaf flower__grass__leaf--5"></div>
        <div className="flower__grass__leaf flower__grass__leaf--6"></div>
        <div className="flower__grass__leaf flower__grass__leaf--7"></div>
        <div className="flower__grass__leaf flower__grass__leaf--8"></div>
        <div className="flower__grass__overlay"></div>
      </div>
    </div>

    <div className="growing-grass">
      <div className="flower__grass flower__grass--2">
        <div className="flower__grass--top"></div>
        <div className="flower__grass--bottom"></div>
        <div className="flower__grass__leaf flower__grass__leaf--1"></div>
        <div className="flower__grass__leaf flower__grass__leaf--2"></div>
        <div className="flower__grass__leaf flower__grass__leaf--3"></div>
        <div className="flower__grass__leaf flower__grass__leaf--4"></div>
        <div className="flower__grass__leaf flower__grass__leaf--5"></div>
        <div className="flower__grass__leaf flower__grass__leaf--6"></div>
        <div className="flower__grass__leaf flower__grass__leaf--7"></div>
        <div className="flower__grass__leaf flower__grass__leaf--8"></div>
        <div className="flower__grass__overlay"></div>
      </div>
    </div>

    <div className="grow-ans" style={{"--d": "2.4s"}}>
      <div className="flower__g-right flower__g-right--1">
        <div className="leaf"></div>
      </div>
    </div>

    <div className="grow-ans" style={{"--d": "2.8s"}}>
      <div className="flower__g-right flower__g-right--2">
        <div className="leaf"></div>
      </div>
    </div>

    <div className="grow-ans" style={{"--d": "2.8s"}}>
      <div className="flower__g-front">
        <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--1">
          <div className="flower__g-front__leaf"></div>
        </div>
        <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--2">
          <div className="flower__g-front__leaf"></div>
        </div>
        <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--3">
          <div className="flower__g-front__leaf"></div>
        </div>
        <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--4">
          <div className="flower__g-front__leaf"></div>
        </div>
        <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--5">
          <div className="flower__g-front__leaf"></div>
        </div>
        <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--6">
          <div className="flower__g-front__leaf"></div>
        </div>
        <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--7">
          <div className="flower__g-front__leaf"></div>
        </div>
        <div className="flower__g-front__leaf-wrapper flower__g-front__leaf-wrapper--8">
          <div className="flower__g-front__leaf"></div>
        </div>
        <div className="flower__g-front__line"></div>
      </div>
    </div>

    <div className="grow-ans" style={{"--d": "3.2s"}}>
      <div className="flower__g-fr">
        <div className="leaf"></div>
        <div className="flower__g-fr__leaf flower__g-fr__leaf--1"></div>
        <div className="flower__g-fr__leaf flower__g-fr__leaf--2"></div>
        <div className="flower__g-fr__leaf flower__g-fr__leaf--3"></div>
        <div className="flower__g-fr__leaf flower__g-fr__leaf--4"></div>
        <div className="flower__g-fr__leaf flower__g-fr__leaf--5"></div>
        <div className="flower__g-fr__leaf flower__g-fr__leaf--6"></div>
        <div className="flower__g-fr__leaf flower__g-fr__leaf--7"></div>
        <div className="flower__g-fr__leaf flower__g-fr__leaf--8"></div>
      </div>
    </div>

    <div className="long-g long-g--0">
      <div className="grow-ans" style={{"--d": "3s"}}>
        <div className="leaf leaf--0"></div>
      </div>
      <div className="grow-ans" style={{"--d": "2.2s"}}>
        <div className="leaf leaf--1"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3.4s"}}>
        <div className="leaf leaf--2"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3.6s"}}>
        <div className="leaf leaf--3"></div>
      </div>
    </div>

    <div className="long-g long-g--1">
      <div className="grow-ans" style={{"--d": "3.6s"}}>
        <div className="leaf leaf--0"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3.8s"}}>
        <div className="leaf leaf--1"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4s"}}>
        <div className="leaf leaf--2"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4.2s"}}>
        <div className="leaf leaf--3"></div>
      </div>
    </div>

    <div className="long-g long-g--2">
      <div className="grow-ans" style={{"--d": "4s"}}>
        <div className="leaf leaf--0"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4.2s"}}>
        <div className="leaf leaf--1"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4.4s"}}>
        <div className="leaf leaf--2"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4.6s"}}>
        <div className="leaf leaf--3"></div>
      </div>
    </div>

    <div className="long-g long-g--3">
      <div className="grow-ans" style={{"--d": "4s"}}>
        <div className="leaf leaf--0"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4.2s"}}>
        <div className="leaf leaf--1"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3s"}}>
        <div className="leaf leaf--2"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3.6s"}}>
        <div className="leaf leaf--3"></div>
      </div>
    </div>

    <div className="long-g long-g--4">
      <div className="grow-ans" style={{"--d": "4s"}}>
        <div className="leaf leaf--0"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4.2s"}}>
        <div className="leaf leaf--1"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3s"}}>
        <div className="leaf leaf--2"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3.6s"}}>
        <div className="leaf leaf--3"></div>
      </div>
    </div>

    <div className="long-g long-g--5">
      <div className="grow-ans" style={{"--d": "4s"}}>
        <div className="leaf leaf--0"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4.2s"}}>
        <div className="leaf leaf--1"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3s"}}>
        <div className="leaf leaf--2"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3.6s"}}>
        <div className="leaf leaf--3"></div>
      </div>
    </div>

    <div className="long-g long-g--6">
      <div className="grow-ans" style={{"--d": "4.2s"}}>
        <div className="leaf leaf--0"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4.4s"}}>
        <div className="leaf leaf--1"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4.6s"}}>
        <div className="leaf leaf--2"></div>
      </div>
      <div className="grow-ans" style={{"--d": "4.8s"}}>
        <div className="leaf leaf--3"></div>
      </div>
    </div>

    <div className="long-g long-g--7">
      <div className="grow-ans" style={{"--d": "3s"}}>
        <div className="leaf leaf--0"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3.2s"}}>
        <div className="leaf leaf--1"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3.5s"}}>
        <div className="leaf leaf--2"></div>
      </div>
      <div className="grow-ans" style={{"--d": "3.6s"}}>
        <div className="leaf leaf--3"></div>
      </div>
    </div>
  </div>
    </div>
  </div>;
}
