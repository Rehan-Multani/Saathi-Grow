import React, { useEffect, useRef, useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import { MapPin, Navigation as NavIcon } from 'lucide-react';

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

  // Stable callback ref to prevent useEffect loop
  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        // Prevent re-initialization if already loaded
        if (autocompleteRef.current) return;

        const { loadGoogleMaps } = await import('../../../../utils/googleMapsLoader');
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
  }, []); // Only run once on mount

  return (
    <div className="position-relative">
      <Form.Control
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Search location..."}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="py-2.5 shadow-none border-light-subtle bg-light-subtle rounded-xl font-bold"
        style={{ paddingRight: '85px' }}
      />
      <div className="position-absolute end-0 top-50 translate-middle-y me-2 d-flex gap-2 align-items-center">
        {isDetecting ? (
          <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
        ) : (
          <button
            type="button"
            onClick={handleDetectLocation}
            className="btn btn-link p-0 text-primary opacity-75 hover-opacity-100 border-0 shadow-none"
            title="Detect Location"
          >
            <NavIcon size={18} fill="currentColor" />
          </button>
        )}
        <div className="text-muted opacity-50 border-start ps-2">
          <MapPin size={18} />
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsInput;
