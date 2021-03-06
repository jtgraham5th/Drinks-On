import React, { Component } from "react";
import NavbarWdivs from "../components/NavbarWdivs";
import axios from "axios";
import GoogleMapReact from "google-map-react";
import MapFlag from "../components/MapFlag";
import CheckoutBtnLB from "../components/CheckOutBtnLB";
import API from "../utils/API";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { ListGroup, ListGroupItem } from "reactstrap";
//---new imports----
import { Collapsible} from "react-materialize";
import { storeBars } from "../actions/barsActions";
import BarInfo from "../components/BarComponents/BarInfo"

class Bars extends Component {
  state = {
    center: {
      lat: null,
      lng: null,
    },
    zoom: 13,
    bars: [],
    searchValue: null,
    longitude: null,
    currentBars: [],
    users: [],
    // disabled: false,
  };
  static defaultProps = {
    center: {
      lat: 33.7756,
      lng: -84.3963,
    },
    zoom: 13,
    // center: "uluru"
  };
  static propTypes = {
    user: PropTypes.object.isRequired,
  };

  async componentDidMount() {
    const { coords } = await this.getUserPosition();
    const { latitude, longitude } = await coords;
    this.setState({ center: { lat: latitude, lng: longitude } }, () =>
      this.searchBars()
    );

    if (this.props.user.isAuthenticated) {
      if (typeof this.props.user.data.omwTo == 'string') {
        this.props.toggleModal("waiting");
      }
    }
  }
  getUserPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
  searchBars = () => {
    const latitude = this.state.center.lat;
    const longitude = this.state.center.lng;

    axios
      .get(`/bars/search_nearby/${latitude}/${longitude}`)
      .then((response) => this.props.storeBars(response.data))
      .then(console.log(this.props.bars));
  };

  searchNewLocation = () => {
    console.log(this.state.searchValue);
    if (this.state.searchValue) {
      const searchValue = this.state.searchValue;
      axios.get(`bars/search/${searchValue}`).then((response) => {
        console.log(response);
        let latitude = response.data.results[0].geometry.location.lat;
        let longitude = response.data.results[0].geometry.location.lng;
        this.setState({ center: { lat: latitude, lng: longitude } }, () =>
          this.searchBars()
        );
      });
    }
  };
  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  deleteBars = (id) => {
    API.deleteBar(id)
      .then((res) => this.loadBars())
      .catch((err) => console.log(err));
  };

  checkin = (event) => {
    if (this.props.user.isAuthenticated) {
      const username = this.props.user.user.name;
      event.preventDefault();
      const index = event.target.id;
      let currentBars = this.state.currentBars;
      const foundBar = this.state.bars[index];
      currentBars.push(foundBar);
      this.setState({
        currentBars,
      });
      console.log(currentBars[0].name);
      axios
        .put("/api/users/checkinBar", {
          userId: username,
          barName: currentBars[0].name,
        })
        .then((res) => console.log(res))
        .catch((err) => {
          console.log(err);
        });
      axios
        .get(`/api/users/${currentBars[0].name}`)
        .then((res) => {
          console.log(res);
          this.setState({
            users: res.data.data,
          });
          console.log(this.state.users);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      this.props.history.push("/");
    }
  };

  checkout = (event) => {
    event.preventDefault();
    const username = this.props.user.user.name;
    this.setState({ currentBars: [] });
    axios
      .put("/api/users/checkinBar", {
        userId: username,
        barName: "null",
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  render() {
    return (
      <>
        <div className="card mb-3">
          <div className="row">
            <div className="col-12">
              <div className="row search-bars-input">
                <input
                  name="searchValue"
                  onChange={this.handleInputChange}
                  placeholder="Enter Location"
                  className="mb-0"
                />

                <button
                  onClick={this.searchNewLocation}
                  className="general-btn btn-lg white black-text mt-0"
                  type="button"
                >
                  Search
                </button>
              </div>
              <div className="card-img-top container" id="map">
                <GoogleMapReact
                  bootstrapURLKeys={{
                    key: "AIzaSyCxdeV70eNJ_KpZDdphRVKntO23zlCg6KA",
                  }}
                  center={this.state.center}
                  zoom={this.state.zoom}
                >
                  {this.props.bars.map((bar, index) => (
                    <MapFlag
                      key={index}
                      lat={bar.mapLocation.lat}
                      lng={bar.mapLocation.lng}
                      text={bar.name}
                    />
                  ))}
                </GoogleMapReact>
              </div>

              <div className="row">
                <div className="col-12">
                  <h5 className="card-title text center">Bars Near You</h5>
                  <Collapsible accordion className="list">
                    <BarInfo bar={this.props.admin} checkin={this.checkin} />
                    {this.props.bars.map((bar, index) => (
                      <BarInfo key={index} bar={bar} checkin={this.checkin} />
                    ))}
                  </Collapsible>
                </div>
              </div>
            </div>
          </div>
        </div>
        <NavbarWdivs />
      </>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user,
  bars: state.bars,
  admin: state.admin
});
export default connect(mapStateToProps, { storeBars })(Bars);
