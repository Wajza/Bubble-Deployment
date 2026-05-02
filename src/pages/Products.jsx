// frontend/src/pages/Products.jsx
import { useState, useEffect } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import { useTheme } from "../context/ThemeContext";

function Products() {
  const { themeData } = useTheme();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedScents, setSelectedScents] = useState([]);
  const [selectedSkinTypes, setSelectedSkinTypes] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then(res => res.json())
      .then(data => {
        console.log("PRODUCTS:", data);
        const customSoap = {
          _id: "custom-soap",
          name: "Custom Soap",
          price: 7,
          image: null,
          scent: "Custom",
          skinType: ["Sensitive"],
          stock: 1,
          customizable: true
        };
        const productsWithoutCustom = data.filter(
          (p) => p.name !== "Custom Soap"
        );

        const finalProducts = [...productsWithoutCustom, customSoap];

        setAllProducts(finalProducts);
        setFilteredProducts(finalProducts);
      })
      .catch(err => console.log(err));
  }, []);

  const handleCheckboxChange = (value, selectedValues, setSelectedValues) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((item) => item !== value));
    } else {
      setSelectedValues([...selectedValues, value]);
    }
  };

  const applyFilters = () => {
    if (minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice)) {
      alert("Invalid price range");
      return;
    }

    const result = allProducts.filter((product) => {
      if (product._id === "custom-soap") return true;
      const matchesPrice = product.price != null && product.price >= Number(minPrice) && product.price <= Number(maxPrice);
      const matchesScent = selectedScents.length === 0 || selectedScents.includes(product.scent);
      const matchesSkinType = selectedSkinTypes.length === 0 || product.skinType?.some((type) => selectedSkinTypes.includes(type));
      return matchesPrice && matchesScent && matchesSkinType;
    });

    setFilteredProducts(result);
  };

  return (
    <div style={{ width: "90%", maxWidth: "1400px", margin: "0 auto", padding: "20px 0" }}>
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {/* Filter Sidebar */}
        <div style={{
          width: "260px",
          background: themeData.cardBg,
          border: `1px solid ${themeData.borderColor}`,
          borderRadius: "24px",
          padding: "20px",
          backdropFilter: "blur(14px)",
          alignSelf: "flex-start",
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "24px", color: themeData.textColor }}>Filter</h2>

          {/* Price Range */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", color: themeData.textColor }}>Price Range</h3>
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                style={{
                  width: "50%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  background: "rgba(255,255,255,0.9)",
                }}
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                style={{
                  width: "50%",
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid #ddd",
                  background: "rgba(255,255,255,0.9)",
                }}
              />
            </div>
            <Button text="Apply Filters" variant="purple" style={{ width: "100%" }} onClick={applyFilters} />
          </div>

          {/* Scent Filter */}
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", color: themeData.textColor }}>Scent</h3>
            {["Lavender", "Rose", "Coconut", "Honey", "Unscented", "Sakura"].map((scent) => (
              <label key={scent} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedScents.includes(scent)}
                  onChange={() => handleCheckboxChange(scent, selectedScents, setSelectedScents)}
                />
                <span style={{ color: themeData.textLight }}>{scent}</span>
              </label>
            ))}
          </div>

          {/* Skin Type Filter */}
          <div>
            <h3 style={{ fontSize: "16px", marginBottom: "12px", color: themeData.textColor }}>Skin Type</h3>
            {["Normal", "Dry", "Oily", "Sensitive"].map((type) => (
              <label key={type} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedSkinTypes.includes(type)}
                  onChange={() => handleCheckboxChange(type, selectedSkinTypes, setSelectedSkinTypes)}
                />
                <span style={{ color: themeData.textLight }}>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div style={{
          flex: 1,
          background: themeData.cardBg,
          border: `1px solid ${themeData.borderColor}`,
          borderRadius: "24px",
          padding: "24px",
          backdropFilter: "blur(14px)",
        }}>
          <h1 style={{ marginTop: 0, marginBottom: "24px", fontSize: "28px", color: themeData.textColor }}>All Products</h1>

          {filteredProducts.length > 0 ? (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "24px"
            }}>
              {filteredProducts.map((product) => (
                <Card key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ color: themeData.textLight, fontSize: "18px" }}>No products match your filters</p>
              <button
                onClick={() => {
                  setSelectedScents([]);
                  setSelectedSkinTypes([]);
                  setMinPrice(0);
                  setMaxPrice(100);
                  setFilteredProducts(allProducts);
                }}
                style={{
                  marginTop: "16px",
                  background: themeData.primary,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ THIS IS CRITICAL - Default export at the bottom
export default Products;