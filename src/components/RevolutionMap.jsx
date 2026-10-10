import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { revolutions } from '../data/revolutions.js'

// OpenStreetMap(Leaflet) 기반 혁명 지도.
// 각 혁명이 일어난 도시에 번호 핀을 찍고, 클리어하면 초록색으로 표시한다.
// 핀을 클릭하면 해당 스테이지 학습 화면으로 이동.

function makePinIcon(number, cleared, accent) {
  const bg = cleared ? '#43d9ad' : accent || '#ffd166'
  const check = cleared ? '✓' : number
  const html = `
    <div style="
      width:30px;height:30px;line-height:30px;
      background:${bg};color:#0f1535;
      border:2px solid #0f1535;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      text-align:center;font-weight:800;font-size:14px;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
    ">
      <span style="display:inline-block;transform:rotate(45deg);">${check}</span>
    </div>`
  return L.divIcon({
    html,
    className: 'revolution-pin',
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -28],
  })
}

export default function RevolutionMap({ progress }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [30, -20],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      scrollWheelZoom: true,
      worldCopyJump: true,
    })
    mapRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap 기여자',
      maxZoom: 19,
    }).addTo(map)

    revolutions.forEach((rev, idx) => {
      if (!rev.coords) return
      const cleared = progress?.[rev.id]?.cleared
      const marker = L.marker(rev.coords, {
        icon: makePinIcon(idx + 1, cleared, rev.color),
        title: rev.title,
        keyboard: true,
        alt: `${rev.title} (${rev.year}년)`,
      }).addTo(map)

      marker.bindPopup(
        `<div style="min-width:160px">
          <strong>${rev.emoji} ${rev.title}</strong><br/>
          <span style="color:#555">${rev.year}년</span><br/>
          <span style="font-size:12px">${rev.summary}</span><br/>
          <button data-stage="${rev.id}" class="map-go-btn"
            style="margin-top:8px;cursor:pointer;border:none;border-radius:8px;
                   padding:6px 10px;background:#1d3557;color:#fff;font-weight:700;">
            학습하러 가기 →
          </button>
        </div>`
      )
    })

    // 팝업 내 버튼 클릭 → 라우팅 (이벤트 위임)
    map.on('popupopen', (e) => {
      const btn = e.popup.getElement()?.querySelector('.map-go-btn')
      if (btn) {
        btn.addEventListener('click', () => {
          navigate(`/stage/${btn.getAttribute('data-stage')}`)
        })
      }
    })

    // 지도 크기 보정 (초기 렌더 시 타일 깨짐 방지)
    setTimeout(() => map.invalidateSize(), 200)

    return () => {
      map.remove()
      mapRef.current = null
    }
    // navigate/progress 변화 시 재생성하지 않도록 최초 1회만. progress 색상 갱신은
    // 홈 재진입(언마운트→마운트) 시 반영된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} className="osm-map" />
}
