// 전역 선언
let map;
let markerGroup;

document.addEventListener("DOMContentLoaded", function () {
  map = L.map('map').setView([40.7128, -74.0060], 12);

  const layers = {
    'osm': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }),
    'satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri & Contributors'
    }),
    'dark': L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© CartoDB'
    })
  };

  layers['osm'].addTo(map);
  markerGroup = L.layerGroup().addTo(map);

  // ✅ 1. 페이지 로드시 전체 불러오기
  loadAllKiosks();

  // ✅ 2. 전 지도 스타일/사이즈/ZIP 검색 함수
  window.changeMapStyle = function (style) {
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) map.removeLayer(layer);
    });
    layers[style].addTo(map);
  };

  window.resizeMap = function (size) {
    document.getElementById("map").style.height = size + "px";
    document.getElementById("mapSizeValue").innerText = size + "px";
    map.invalidateSize();
  };

  // ✅ 3. 전체 불러오기 함수
  function loadAllKiosks() {
    const apiUrl = `https://data.cityofnewyork.us/resource/s4kf-3yrf.json`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        markerGroup.clearLayers();

        data.forEach(point => {
          if (point.latitude && point.longitude) {
            const kioskType = point["planned_kiosk_type"] || "Unknown Type";
            const address = point["street_address"] || "No address available";
            const color = kioskType.toLowerCase().includes("5g") ? "blue" : "green";

            const marker = L.circleMarker([+point.latitude, +point.longitude], {
              color: color,
              fillColor: color,
              fillOpacity: 0.8,
              radius: 6
            });

            marker.bindTooltip(`<b>Type: ${kioskType}</b><br>${address}`);
            markerGroup.addLayer(marker);
          }
        });
      })
      .catch(error => console.error("Error fetching ALL data:", error));
  }

  // ✅ 4. ZIP 검색 함수는 유지
  window.loadMap = function () {
    const zipcode = document.getElementById("zipcode").value.trim();
    if (!zipcode) {
      alert("Please enter a ZIPCODE.");
      return;
    }

    const apiUrl = `https://data.cityofnewyork.us/resource/s4kf-3yrf.json?$where=Postcode='${zipcode}'`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        markerGroup.clearLayers();

        if (data.length === 0) {
          alert("No LinkNYC locations found for this ZIPCODE.");
          return;
        }

        data.forEach(point => {
          if (point.latitude && point.longitude) {
            const kioskType = point["planned_kiosk_type"] || "Unknown Type";
            const address = point["street_address"] || "No address available";
            const color = kioskType.toLowerCase().includes("5g") ? "blue" : "green";

            const marker = L.circleMarker([+point.latitude, +point.longitude], {
              color: color,
              fillColor: color,
              fillOpacity: 0.8,
              radius: 6
            });

            marker.bindTooltip(`<b>Type: ${kioskType}</b><br>${address}`);
            markerGroup.addLayer(marker);
          }
        });

        const firstPoint = data[0];
        map.setView([+firstPoint.latitude, +firstPoint.longitude], 14);
      })
      .catch(error => console.error("Error fetching ZIP data:", error));
  };

  // 이미지 오버레이 관련 함수도 그대로
  window.showImage = function (type) {
    const img = document.getElementById("kiosk-image");
    const overlay = document.getElementById("image-overlay");

    img.src = type === "link1"
      ? "https://www.link.nyc/assets/img/LinkNYC.jpg"
      : "https://www.amny.com/wp-content/uploads/2023/04/MG_4810-2048x1365.jpg";

    img.onload = () => overlay.style.display = "block";
  };

  window.hideImage = function () {
    document.getElementById("image-overlay").style.display = "none";
  };
});
