import React from "react";
import notFoundCss from "./notFoundCss.module.css";
import Header from "../../components/Header/header";
import Footer from "../../components/Footer/footer";

const Notfound = () => {
    return (
        <div>
            <Header />
            <div className={notFoundCss.container}>
                <div className={notFoundCss.centeredContent}>
                    <div className={[notFoundCss.row, notFoundCss.width_100].join(" ")}>
                        <h1 className={notFoundCss.alignCenter}>Not found</h1>
                    </div>
                </div>
            </div>
            <Footer />
        </div >
    );
};
export default Notfound;