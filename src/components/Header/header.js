import React from "react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom shadow-sm">
      <Link to="/" className="my-0 mr-md-5 font-weight-normal">
        <h5>Crypto Curr</h5>
      </Link>
      <nav className="my-2 my-md-0 mr-md-auto"></nav>
    </div>
  );
};

export default Header;
