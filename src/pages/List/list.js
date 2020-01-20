import React, { useState, useEffect } from "react";
import listCss from "./listCss.module.css"
import axios from "axios";
import { Link } from "react-router-dom";
import $ from "jquery";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";

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

const List = () => {
    const [assets, setAssets] = useState([])
    const [rates, setRates] = useState([])
    let [searchTerm, setSearchTerm] = useState('');
    let [selectedRate, selectRate] = useState('USD')
    let [covnversionRate, setCovnversionRate] = useState(1)

    useEffect(() => {
        getAssets().then((res) => {
            setAssets(res.data.data);
        }, (err) => {
            console.log(err);
        });
    }, []);

    useEffect(() => {
        getRates().then((res) => {
            setRates(res.data.data);
            console.log(res.data.data);
        }, (err) => {
            console.log(err);
        });
    }, []);

    const getConversionRate = () => {
        rates.map(rate => {
            console.log("rate.symbol: " + rate.symbol + " selectedRate:" + selectedRate);
            if(rate.symbol === selectedRate){
                setCovnversionRate(rate.rateUsd);
            }
        });
        console.log("covnversionRate: " + covnversionRate);
    };

    const renderTable = () => {
        return assets.map(asset => {
            if(searchTerm !== undefined && (asset.name.toLowerCase() === searchTerm || asset.symbol.toLowerCase() === searchTerm)){
                return (
                    
                        <tr>
                            <th scope="row">{asset.rank}</th>
                            <td><Link to={'/detail/'+asset.id}>{asset.symbol}</Link></td>
                            <td><Link to={'/detail/'+asset.id}>{asset.name}</Link></td>
                            <td>{asset.supply * covnversionRate}</td>
                            <td>{asset.marketCapUsd * covnversionRate}</td>
                            <td>{asset.volumeUsd24Hr * covnversionRate}</td>
                            <td>{asset.priceUsd * covnversionRate}</td>
                        </tr>
                    
                    
                )
            } else if(searchTerm === "") {
                console.log("asset.name: "  + asset.name + " asset.priceUsd: " + asset.priceUsd + " covnversionRate: " + covnversionRate);
                return (
                    <tr>
                        <th scope="row">{asset.rank}</th>
                        <td><Link to={'/detail/'+asset.id}>{asset.symbol}</Link></td>
                        <td><Link to={'/detail/'+asset.id}>{asset.name}</Link></td>
                        <td>{asset.supply * covnversionRate}</td>
                        <td>{asset.marketCapUsd * covnversionRate}</td>
                        <td>{asset.volumeUsd24Hr * covnversionRate}</td>
                        <td>{asset.priceUsd * covnversionRate}</td>
                    </tr>
                )
            }  
        });
    };

    const renderDropdown = () => {
        return rates.map(rate => {
            if(rate.type === "fiat"){
                return (
                    <a class="dropdown-item" href="#">{rate.symbol}</a>
                );
            }
        });
    };

    const getSearchTerm = (term) => {
        searchTerm = term.toLowerCase();
        console.log(searchTerm);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        console.log("onSubmit:" + searchTerm);
        setSearchTerm(searchTerm);
    };

    // to set dropdown menu text to the selected rate
    $(function () {
        $(".dropdown-menu").on('click', 'a', function () {
            $(".btn:first-child").text($(this).text());
            $(".btn:first-child").val($(this).text());
            selectRate($(this).text());
            $(".dropdown-menu").off('click');
        });
    });

    useEffect(() => {
        getConversionRate();
    }, [selectedRate]);
    

    return (
        <div>
            <Header />
            <div className={listCss.container}>
                <form className="form-inline">
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
                        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Currencies
                        </button>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            {renderDropdown()}
                        </div>
                    </div>
                </form>
                <div className={[listCss.row, listCss.width_100].join(" ")}>
                    <div>
                        <table class="table table-hover table-responsive-xl">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col">Symbol</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Supply</th>
                                    <th scope="col">Market Cap {selectedRate}</th>
                                    <th scope="col">Volume {selectedRate} 24Hr</th>
                                    <th scope="col">Price {selectedRate}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {renderTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default List;
