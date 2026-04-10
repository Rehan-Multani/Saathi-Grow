import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation as NavIcon, Loader2 } from 'lucide-react';

const GoogleMapsInput = ({ onLocationSelect, placeholder, defaultValue = '' }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  const reverseGeocode = async (lat, lng) => {
    if (!window.google) return null;
    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat, lng };

    return new Promise((resolve) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const place = results[0];
          const addressData = {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            lat: lat,
            lng: lng,
            fullAddress: place.formatted_address
          };

          place.address_components.forEach(component => {
            const type = component.types[0];
            if (type === "street_number" || type === "route") {
              addressData.street += (addressData.street ? " " : "") + component.long_name;
            } else if (type === "locality") {
              addressData.city = component.long_name;
            } else if (type === "administrative_area_level_1") {
              addressData.state = component.long_name;
            } else if (type === "postal_code") {
              addressData.zipCode = component.long_name;
            }
          });
          resolve(addressData);
        } else {
          resolve(null);
        }
      });
    });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const addressData = await reverseGeocode(latitude, longitude);
        if (addressData) {
          setInputValue(addressData.fullAddress);
          onLocationSelect(addressData);
        }
        setIsDetecting(false);
      },
      (error) => {
        console.error("Error detecting location:", error);
        alert("Failed to detect location. Please search manually.");
        setIsDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        if (autocompleteRef.current) return;

        const { loadGoogleMaps } = await import('../../../utils/googleMapsLoader');
        await loadGoogleMaps();
        if (isMounted) {
          initAutocomplete();
        }
      } catch (err) {
        console.error("Maps load failed in input:", err);
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };

    function initAutocomplete() {
      if (!inputRef.current) return;

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "in" },
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["address"]
      });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();
        if (!place.geometry) return;

        const addressData = {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          fullAddress: place.formatted_address
        };

        place.address_components.forEach(component => {
          const type = component.types[0];
          if (type === "street_number" || type === "route") {
            addressData.street += (addressData.street ? " " : "") + component.long_name;
          } else if (type === "locality") {
              addressData.city = component.long_name;
          } else if (type === "administrative_area_level_1") {
            addressData.state = component.long_name;
          } else if (type === "postal_code") {
            addressData.zipCode = component.long_name;
          }
        });

        setInputValue(place.formatted_address);
        if (onLocationSelectRef.current) {
          onLocationSelectRef.current(addressData);
        }
      });
    }
  }, []);

  return (
    <div className="relative w-full group">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Search location..."}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="w-full pl-4 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500/50 focus:bg-white transition-all shadow-inner"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
        {isDetecting ? (
          <Loader2 size={16} className="text-blue-500 animate-spin" />
        ) : (
          <button
            type="button"
            onClick={handleDetectLocation}
            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all border-none bg-transparent"
            title="Detect Location"
          >
            <NavIcon size={16} />
          </button>
        )}
        <div className="h-4 border-l border-slate-200" />
        <MapPin size={16} className="text-slate-300" />
      </div>
    </div>
  );
};

export default GoogleMapsInput;
