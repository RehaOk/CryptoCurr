import $ from "jquery";
import axios from "axios";
import listCss from "./listCss.module.css"
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";

import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

const SYMBOL = "Symbol"
const NAME = "Name"
const SUPPLY = "Supply"
const MARKET_CAP = "Market Cap"
const VOLUME = "Volume"
const PRICE = "Price"
const RANK = "Rank"

let currentPage = 1;
let numberOfPages = 0;
let recordsPerPage = 10;

const responseHandler = (response, resolve) => {
  if (response.status === 200) {
    resolve(response);
  }
};

const errorHandler = (error, reject) => {
  if (error.response && (error.response.status >= 401 || error.response.status <= 417)) {
    reject("Client error " + error);
  } else if (error.response && (error.response.status >= 500 || error.response.status <= 505)) {
    reject("Try back again soon! " + error);
  }
};

const getAssets = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://api.coincap.io/v2/assets"
      )
      .then(response => {
        responseHandler(response, resolve);
      })
      .catch(error => {
        errorHandler(error, reject);
      });
  });
};

const getRates = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(
        "https://api.coincap.io/v2/rates"
      )
      .then(response => {
        responseHandler(response, resolve);
      })
      .catch(error => {
        errorHandler(error, reject);
      });
  });
};

const numPages = (assets) => {
  numberOfPages = Math.ceil(assets.length / recordsPerPage);
}

const prevPage = (assets, setAssetsToShow) => {
  if (currentPage > 1) {
    currentPage--;
    changePage(currentPage, assets, setAssetsToShow);
  }
}

const nextPage = (assets, setAssetsToShow) => {
  if (currentPage < numberOfPages) {
    currentPage++;
    changePage(currentPage, assets, setAssetsToShow);
  }
}

const changePage = (page, assets, setAssetsToShow) => {
  let elementsToShow = [];
  // Validate page
  if (page < 1) page = 1;
  if (page > numberOfPages) page = numberOfPages;

  for (var i = (page - 1) * recordsPerPage; i < (page * recordsPerPage); i++) {
    elementsToShow.push(assets[i]);
  }
  setAssetsToShow(elementsToShow);
  currentPage = page;
}

const renderPagination = (numberOfPages, assets, setAssetsToShow) => {
  let pagination = [];
  pagination.push(<li onClick={() => prevPage(assets, setAssetsToShow)} class="page-item"><a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a></li>);
  for (let i = 1; i <= numberOfPages; i++) {
    if (i === currentPage) {
      pagination.push(<li onClick={() => changePage(i, assets, setAssetsToShow)} class="page-item active"><a class="page-link" href="#">{i}</a></li>);
    } else {
      pagination.push(<li onClick={() => changePage(i, assets, setAssetsToShow)} class="page-item"><a class="page-link" href="#">{i}</a></li>);
    }
  }
  pagination.push(<li onClick={() => nextPage(assets, setAssetsToShow)} class="page-item"><a class="page-link" href="#">Next</a></li>);
  return pagination.map((item) => {
    return item;
  });
}

const List = () => {
  const [rates, setRates] = useState([])
  const [assets, setAssets] = useState([])
  const [selectedRate, selectRate] = useState('USD')
  const [sortType, selectSortType] = useState('Rank')
  const [covnversionRate, setCovnversionRate] = useState(1)
  const [assetsToShow, setAssetsToShow] = useState([])
  let [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getAssets().then((res) => {
      setAssets(res.data.data);
      $('#spinner').addClass('d-none');
      $('#table').removeClass('d-none');
      $('#form').removeClass('d-none');
    }, (err) => {
      console.log(err);
    });
  }, []);

  useEffect(() => {
    numPages(assets);
    if (assets.length !== 0) {
      changePage(1, assets, setAssetsToShow);
    }
  }, [assets]);

  useEffect(() => {
    getRates().then((res) => {
      setRates(res.data.data);
    }, (err) => {
      console.log(err);
    });
  }, []);

  const getConversionRate = () => {
    rates.map(rate => {
      console.log("rate.symbol: " + rate.symbol + " selectedRate:" + selectedRate);
      if (rate.symbol === selectedRate) {
        setCovnversionRate(rate.rateUsd);
      }
    });
    console.log("CovnversionRate: " + covnversionRate);
  };

  const isSearchTermInRow = (searchTerm, name, symbol) => {
    return (name.toLowerCase().includes(searchTerm) || symbol.toLowerCase().includes(searchTerm))
  };

  const sortTableRows = (assets) => {
    let sortBy;
    switch (sortType) {
      case "Symbol":
        sortBy = "symbol"
        return assets.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
      case "Name":
        sortBy = "name"
        return assets.sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
      case "Supply":
        sortBy = "supply"
        return assets.sort((a, b) => b[sortBy] - a[sortBy]);
      case "Market Cap":
        sortBy = "marketCapUsd"
        return assets.sort((a, b) => b[sortBy] - a[sortBy]);
      case "Volume":
        sortBy = "volumeUsd24Hr"
        return assets.sort((a, b) => b[sortBy] - a[sortBy]);
      case "Price":
        sortBy = "priceUsd"
        return assets.sort((a, b) => b[sortBy] - a[sortBy]);
      case "Rank":
        sortBy = "rank"
        return assets.sort((a, b) => a[sortBy] - b[sortBy]);
    }
  }

  const renderTable = () => {
    let indexCount = 0;
    if (searchTerm === "") {
      let assetsOnPage = sortTableRows(assetsToShow);
      return assetsOnPage.map(asset => {
        return (
          <tr>
            <th scope="row">{asset.rank}</th>
            <td><Link to={'/detail/' + asset.id}>{asset.symbol}</Link></td>
            <td><Link to={'/detail/' + asset.id}>{asset.name}</Link></td>
            <td>{asset.supply * covnversionRate}</td>
            <td>{asset.marketCapUsd * covnversionRate}</td>
            <td>{asset.volumeUsd24Hr * covnversionRate}</td>
            <td>{asset.priceUsd * covnversionRate}</td>
          </tr>
        )
      });
    } else if (searchTerm !== undefined) {
      let assetsOnPage = sortTableRows(assets);
      return assetsOnPage.map(asset => {
        if (isSearchTermInRow(searchTerm, asset.name, asset.symbol)) {
          indexCount += 1;
          return (
            <tr>
              <th scope="row">{indexCount}</th>
              <td><Link to={'/detail/' + asset.id}>{asset.symbol}</Link></td>
              <td><Link to={'/detail/' + asset.id}>{asset.name}</Link></td>
              <td>{asset.supply * covnversionRate}</td>
              <td>{asset.marketCapUsd * covnversionRate}</td>
              <td>{asset.volumeUsd24Hr * covnversionRate}</td>
              <td>{asset.priceUsd * covnversionRate}</td>
            </tr>
          )
        }
      });
    }
  };

  const renderDropdown = () => {
    rates.sort((a, b) => a.symbol.localeCompare(b.symbol));
    return rates.map(rate => {
      if (rate.type === "fiat") {
        return (
          <a class="dropdown-item" href="#">{rate.symbol}</a>
        );
      }
    });
  };

  const getSearchTerm = (term) => {
    searchTerm = term.toLowerCase();
    // For empty search input
    if (searchTerm === "") {
      setSearchTerm(searchTerm);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchTerm);
  };

  // to set dropdown menu text to the selected rate
  $(function () {
    $(".dropdown-menu.currency").on('click', 'a', function () {
      $(".btn.currency:first-child").text($(this).text());
      $(".btn.currency:first-child").val($(this).text());
      selectRate($(this).text());
      $(".dropdown-menu.currency").off('click');
    });
  });

  $(function () {
    $(".dropdown-menu.sort").on('click', 'a', function () {
      $(".btn.sort:first-child").text($(this).text());
      $(".btn.sort:first-child").val($(this).text());
      selectSortType($(this).text());
      $(".dropdown-menu.sort").off('click');
    });
  });

  useEffect(() => {
    getConversionRate();
  }, [selectedRate]);

  return (
    <div>
      <Header />
      <div className={listCss.container}>
        <form id="form" className="form-inline d-none">
          <input
            className="form-control mr-sm-2 my-3"
            type="search"
            placeholder="Search"
            aria-label="Search"
            onChange={e => getSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-outline-primary mx-auto my-2 my-sm-0"
            onClick={onSubmit}
            type="submit"
          >
            Search
                        </button>
          <div class="dropdown ml-2">
            <button class="btn btn-secondary dropdown-toggle currency" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Currencies
                        </button>
            <div className={["dropdown-menu currency", listCss.overflow_auto].join(" ")} aria-labelledby="dropdownMenuButton">
              {renderDropdown()}
            </div>
          </div>
          <div class="dropdown ml-2">
            <button class="btn btn-secondary dropdown-toggle sort" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Sort By
                        </button>
            <div className="dropdown-menu sort" aria-labelledby="dropdownMenuButton">
              <a class="dropdown-item" href="#">{SYMBOL}</a>
              <a class="dropdown-item" href="#">{NAME}</a>
              <a class="dropdown-item" href="#">{SUPPLY}</a>
              <a class="dropdown-item" href="#">{MARKET_CAP}</a>
              <a class="dropdown-item" href="#">{VOLUME}</a>
              <a class="dropdown-item" href="#">{PRICE}</a>
              <a class="dropdown-item" href="#">{RANK}</a>
            </div>
          </div>
        </form>
        <div className={listCss.row}>
          <div class="d-flex align-items-center">
            <div id="spinner" class="spinner-border text-primary ml-auto" role="status" aria-hidden="true"></div>
          </div>
        </div>
        <div id="table" className={[listCss.row, listCss.width_100, "d-none"].join(" ")}>
          <div>
            <table class="table table-hover table-responsive-xl">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">{SYMBOL}</th>
                  <th scope="col">{NAME}</th>
                  <th scope="col">{SUPPLY}</th>
                  <th scope="col">{MARKET_CAP} {selectedRate}</th>
                  <th scope="col">{VOLUME} {selectedRate} 24Hr</th>
                  <th scope="col">{PRICE} {selectedRate}</th>
                </tr>
              </thead>
              <tbody>
                {renderTable()}
              </tbody>
            </table>
            <nav className="float-right" aria-label="...">
              <ul class="pagination">
                {renderPagination(numberOfPages, assets, setAssetsToShow)}
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default List;
