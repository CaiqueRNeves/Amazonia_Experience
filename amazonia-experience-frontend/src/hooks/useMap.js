import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';

/**
 * Hook personalizado para gerenciar mapas Leaflet
 * Configura e gerencia um mapa interativo com marcadores, rotas e outros elementos
 * 
 * @param {Object} options - Opções de configuração do mapa
 * @param {Array} options.initialMarkers - Marcadores iniciais para o mapa
 * @param {Object} options.center - Coordenadas iniciais do centro do mapa
 * @param {number} options.zoom - Nível de zoom inicial
 * @param {string} options.tileLayer - URL do tile layer
 * @returns {Object} Objeto com referência ao mapa e funções úteis
 */
const useMap = ({
  initialMarkers = [],
  center = { lat: -1.455833, lng: -48.503889 }, // Coordenadas de Belém do Pará
  zoom = 13,
  tileLayer = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
} = {}) => {
  // Referência para o container do mapa
  const mapRef = useRef(null);
  // Referência para a instância do mapa Leaflet
  const mapInstanceRef = useRef(null);
  // Estado para armazenar todos os marcadores
  const [markers, setMarkers] = useState(initialMarkers);
  // Estado para a rota atual
  const [currentRoute, setCurrentRoute] = useState(null);
  // Estado para rastrear se o mapa foi inicializado
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Inicializa o mapa quando o componente é montado
  useEffect(() => {
    // Verifica se o mapa já foi inicializado ou se a referência do contêiner não existe
    if (isMapInitialized || !mapRef.current) return;
    
    // Cria uma nova instância do mapa
    const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom);
    
    // Adiciona o tile layer
    L.tileLayer(tileLayer, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
    
    // Salva a instância do mapa na referência
    mapInstanceRef.current = map;
    
    // Adiciona os marcadores iniciais
    if (initialMarkers.length > 0) {
      initialMarkers.forEach(marker => {
        addMarker(marker);
      });
    }
    
    // Marca o mapa como inicializado
    setIsMapInitialized(true);
    
    // Limpa o mapa quando o componente é desmontado
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapInitialized(false);
      }
    };
  }, [center.lat, center.lng, zoom, tileLayer, isMapInitialized, initialMarkers]);

  // Função para adicionar um marcador ao mapa
  const addMarker = (markerData) => {
    if (!mapInstanceRef.current) return;
    
    const { lat, lng, title, icon, popup, id } = markerData;
    
    // Cria o ícone do marcador, se fornecido
    const markerIcon = icon
      ? L.icon({
          iconUrl: icon.url,
          iconSize: icon.size || [25, 41],
          iconAnchor: icon.anchor || [12, 41],
          popupAnchor: icon.popupAnchor || [1, -34]
        })
      : new L.Icon.Default();
    
    // Cria e adiciona o marcador ao mapa
    const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(mapInstanceRef.current);
    
    // Adiciona título ao marcador
    if (title) {
      marker.bindTooltip(title);
    }
    
    // Adiciona popup ao marcador
    if (popup) {
      marker.bindPopup(popup);
    }
    
    // Atualiza o estado dos marcadores
    setMarkers(prev => [
      ...prev,
      { ...markerData, leafletMarker: marker, id: id || `marker-${Date.now()}` }
    ]);
    
    return marker;
  };

  // Função para remover um marcador do mapa
  const removeMarker = (markerId) => {
    if (!mapInstanceRef.current) return;
    
    // Encontra o marcador pelo ID
    const markerIndex = markers.findIndex(m => m.id === markerId);
    
    if (markerIndex !== -1) {
      // Remove o marcador do mapa
      mapInstanceRef.current.removeLayer(markers[markerIndex].leafletMarker);
      
      // Atualiza o estado dos marcadores
      setMarkers(prev => prev.filter(m => m.id !== markerId));
    }
  };

  // Função para limpar todos os marcadores
  const clearMarkers = () => {
    if (!mapInstanceRef.current) return;
    
    // Remove todos os marcadores do mapa
    markers.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker.leafletMarker);
    });
    
    // Limpa o estado dos marcadores
    setMarkers([]);
  };

  // Função para traçar uma rota entre dois pontos
  const drawRoute = (startPoint, endPoint, options = {}) => {
    if (!mapInstanceRef.current) return;
    
    // Remove rota existente, se houver
    if (currentRoute) {
      mapInstanceRef.current.removeLayer(currentRoute);
    }
    
    // Cria a linha da rota
    const routeLine = L.polyline(
      [
        [startPoint.lat, startPoint.lng],
        [endPoint.lat, endPoint.lng]
      ],
      {
        color: options.color || 'blue',
        weight: options.weight || 5,
        opacity: options.opacity || 0.7,
        ...options
      }
    ).addTo(mapInstanceRef.current);
    
    // Ajusta a visualização para mostrar toda a rota
    mapInstanceRef.current.fitBounds(routeLine.getBounds(), {
      padding: [50, 50]
    });
    
    // Atualiza o estado da rota atual
    setCurrentRoute(routeLine);
    
    return routeLine;
  };

  // Função para remover a rota atual
  const clearRoute = () => {
    if (!mapInstanceRef.current || !currentRoute) return;
    
    // Remove a rota do mapa
    mapInstanceRef.current.removeLayer(currentRoute);
    setCurrentRoute(null);
  };

  // Função para mover o mapa para uma posição
  const panTo = (latLng, zoom) => {
    if (!mapInstanceRef.current) return;
    
    // Move o mapa para a posição especificada
    mapInstanceRef.current.setView([latLng.lat, latLng.lng], zoom || mapInstanceRef.current.getZoom());
  };

  // Função para ajustar a visualização a limites específicos
  const fitBounds = (bounds, options = {}) => {
    if (!mapInstanceRef.current) return;
    
    // Ajusta a visualização aos limites especificados
    mapInstanceRef.current.fitBounds(bounds, options);
  };

  // Retorna a instância do mapa e funções úteis
  return {
    mapRef,
    mapInstance: mapInstanceRef.current,
    markers,
    isMapInitialized,
    addMarker,
    removeMarker,
    clearMarkers,
    drawRoute,
    clearRoute,
    panTo,
    fitBounds
  };
};

export default useMap;