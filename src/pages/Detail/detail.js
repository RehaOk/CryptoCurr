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

const Detail = (props) => {
    const [asset, setAsset] = useState([]);
    const [history, setPriceHistory] = useState([]);

    useEffect(() => {
        getAsset(props.match.params.id).then((res) => {
            setAsset(res.data.data);
            console.log(res.data.data);
        }, (err) => {
            console.log(err);
        });
    }, []);

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

    const getMaxPrice = (data) => {
        if(data.price >= maxPrice){
            maxPrice = data.price;
        }
    };

    const refactorHistory = (history) => {
        return history.map(data => {
            getMaxPrice(data);
            return {priceUsd: setDigits(data.priceUsd), date: data.date.split('T')[0]};
        });
    };

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
                                    { SUPPLY }
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(asset.supply)}</span>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    {MAX_SUPPLY }
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(asset.maxSupply)}</span>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    { MARKET_CAP_USD }
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(asset.marketCapUsd)}</span>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    { VOLUME_USD_24 }
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(asset.volumeUsd24Hr)}</span>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    { PRICE_USD }
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(asset.priceUsd)}</span>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    { CHANGE_PERCENT_24 }
                                    <span className="badge badge-primary badge-pill float-right">{(Number(asset.changePercent24Hr)).toFixed(5)}</span>
                                </li>
                                <li className="list-group-item list-group-item-action">
                                    { VWAP_24 }
                                    <span className="badge badge-primary badge-pill float-right">{setDigits(asset.vwap24Hr)}</span>
                                </li>
                            </ul>
                        </div>
                        <div id="chart" className="col-sm-12 col-md-9 col-lg-9 col-xl-9 mt-5 d-none">
                            <div className={detailCss.contentContainer}>
                                <LineChart width={500} height={300} data={history}>
                                    <XAxis dataKey="date"/>
                                    <YAxis dataKey="priceUsd" domain={[0, maxPrice]}/>
                                    <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                                    <Tooltip/>
                                    <Legend />
                                    <Line type="monotone" dataKey="priceUsd" stroke="#007BFF" />
                                    {/* <Line type="monotone" dataKey="date" stroke="#82ca9d" /> */}
                                </LineChart>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};


export default Detail;
