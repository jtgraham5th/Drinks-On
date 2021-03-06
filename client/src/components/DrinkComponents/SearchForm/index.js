import React from "react";
import "./style.css";
import OrderBtn from "../OrderBtn";

// Using the datalist element we can create autofill suggestions based on the props.breeds array
function SearchForm(props) {
  return (
    <div className="search-form">
      <h5>Search For a Drink</h5>
      <div className="row">
        <div className="col-12">
          <input
            name="searchValue"
            value={props.searchQuery}
            onChange={props.handleInputChange}
            placeholder="Type in a drink name or ingredient to begin"
          />
          <div className="row justify-content-center">
            <button onClick={props.handleFormSubmit} className="general-btn btn-lg white black-text mr-3">
              Search
            </button>
            <OrderBtn createOrder={props.createOrder} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchForm;
