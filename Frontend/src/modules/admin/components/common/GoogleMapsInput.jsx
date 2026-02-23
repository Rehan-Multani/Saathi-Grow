import React, { useEffect, useRef, useState } from 'react';
import { Form, ListGroup } from 'react-bootstrap';
import { MapPin } from 'lucide-react';

const GoogleMapsInput = ({ onLocationSelect, placeholder, defaultValue = '' }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    // Only load if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = initAutocomplete;
      document.head.appendChild(script);
    } else {
      initAutocomplete();
    }

    function initAutocomplete() {
      if (!inputRef.current) return;

      // Restrict results to India for Saathi-Grow as it's an Indian project based on currency and phone formats
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

        if (!addressData.city) {
          // Fallback for city usually found in sublocality_level_1 or others
          const fallbackCity = place.address_components.find(c => c.types.includes("sublocality_level_1"));
          if (fallbackCity) addressData.city = fallbackCity.long_name;
        }

        setInputValue(place.formatted_address);
        onLocationSelect(addressData);
      });
    }
  }, [onLocationSelect]);

  return (
    <div className="position-relative">
      <Form.Control
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Search location..."}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="py-2 pr-4 shadow-none border-light-subtle bg-light-subtle"
      />
      <div className="position-absolute end-0 top-50 translate-middle-y me-2 text-muted opacity-50">
        <MapPin size={18} />
      </div>
    </div>
  );
};

export default GoogleMapsInput;
