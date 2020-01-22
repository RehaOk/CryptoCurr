import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from "axios";
import $ from "jquery";
import detailCss from "./detailCss.module.css";
import { setDigits } from "../../utils/utils";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";

const SUPPLY = "Supply";
const MAX_SUPPLY = "Max Supply";
const MARKET_CAP_USD = "Market Cap USD";
const VOLUME_USD_24 = "Volume USD 24hr";
const PRICE_USD = "Price USD";
const CHANGE_PERCENT_24 = "Change Percent 24hr";
const VWAP_24 = "Vwap 24 hr";

let maxPrice = 0;

const responseHandler = (response, resolve) => {
    if (response.status === 200) {
        resolve(response);
    }
};

const errorHandler = (error, reject) => {
    if (error.response && (error.response.status >= 401 || error.response.status <= 417)) {
        reject("Client error - " + error);
    } else if (error.response && (error.response.status >= 500 || error.response.status <= 505)) {
        reject("Try back again soon! - " + error);
    }
};

const getAsset = (assetId) => {
    return new Promise((resolve, reject) => {
        axios
            .get(
                `https://api.coincap.io/v2/assets/${assetId}`
            )
            .then(response => {
                responseHandler(response, resolve);
            })
            .catch(error => {
                errorHandler(error, reject);
            });
    });
};

const getHistory = (assetId) => {
    return new Promise((resolve, reject) => {
        axios
            .get(
                `https://api.coincap.io/v2/assets/${assetId}/history?interval=d1`
            )
            .then(response => {
                responseHandler(response, resolve);
            })
            .catch(error => {
                errorHandler(error, reject);
            });
    });
};

const getMarkets = () => {
    return new Promise((resolve, reject) => {
        axios
            .get(
                `https://api.coincap.io/v2/markets`
            )
            .then(response => {
                responseHandler(response, resolve);
            })
            .catch(error => {
                errorHandler(error, reject);
            });
    });
};

const getExchangeWithId = (id) => {
    return new Promise((resolve, reject) => {
        axios
            .get(
                `https://api.coincap.io/v2/exchanges/${id}`
            )
            .then(response => {
                responseHandler(response, resolve);
            })
            .catch(error => {
                errorHandler(error, reject);
            });
    });
};

const Detail = (props) => {
    const [asset, setAsset] = useState([]);
    const [history, setPriceHistory] = useState([]);
    const [markets, setMarkets] = useState([]);
    let currencyAvailableMarkets;
    let exchangeUrls = [];
    useEffect(() => {
        getAsset(props.match.params.id).then((res) => {
            setAsset(res.data.data);
            console.log(res.data.data);
        }, (err) => {
            console.log(err);
        });
    }, []);

    useEffect(() => {
        getMarkets().then((res) => {
            setMarkets(res.data.data);
            console.log("markets");
            getCurrencyAvailableMarkets(res.data.data).map((currencyAvailableMarket) => {
                if(currencyAvailableMarket){
                    getExchangeWithId(currencyAvailableMarket.exchangeId).then((exchange) => {
                        exchangeUrls.push(exchange.data.data.exchangeUrl);
                    }, () => {
                        console.log("error:")
                    });
                }
            });
            console.log("exchangeUrls: "+exchangeUrls);
        }, (err) => {
            console.log("markets -" + err);
        });
    }, [asset]);

    useEffect(() => {
        getHistory(props.match.params.id).then((res) => {
            setPriceHistory(refactorHistory(res.data.data));
            $('#spinner').addClass('d-none');
            $('#table').removeClass('d-none');
            $('#chart').removeClass('d-none');
            console.log(res.data.data);
        }, (err) => {
            console.log(err);
        });
    }, []);

    const getCurrencyAvailableMarkets = (markets) => {
        return currencyAvailableMarkets = markets.map((market) => {
            if(asset.name){
                if(market.baseId.toLowerCase() === asset.name.toLowerCase()){
                    return market;
                } else {
                    return undefined;
                }
            }
        });
    };

    const getMaxPrice = (data) => {
        if (data.price >= maxPrice) {
            maxPrice = data.price;
        }
    };

    const refactorHistory = (history) => {
        return history.map(data => {
            getMaxPrice(data);
            return { priceUsd: setDigits(data.priceUsd), date: data.date.split('T')[0] };
        });
    };

    const demoOnClick = (e) => {
        // chartX,chartY,activeTooltipIndex,activeLabel,activePayload,activeCoordinate
        alert(e.activeTooltipIndex + " " + e.activeLabel + " " + e.activePayload);
        console.log(e.activePayload);
    }

    return (
        <div>
            <Header asset={asset} />
            <div className={detailCss.container}>
                <div className={detailCss.centeredContent}>
                    <div className={[detailCss.row, detailCss.width_100].join(" ")}>
                        <div class="d-flex align-items-center">
                            <div id="spinner" class="spinner-border text-primary ml-auto" role="status" aria-hidden="true"></div>
                        </div>
                        <div id="table" className="col-sm-12 col-md-3 col-lg-3 col-xl-3 d-none">
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                                    <b>{asset.name}</b>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    OPEN
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(/* candles.open */)}</span>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    HIGH
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(/* candles.high */)}</span>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    LOW
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(/* candles.low */)}</span>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    CLOSE
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(/* candles.close */)}</span>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    VOLUME
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(/* candles.volume */)}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};


export default Detail;
