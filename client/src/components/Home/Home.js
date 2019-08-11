import React, { Component } from "react";
import Header from "../Header/Header";
import Search from "../Search/Search";
import Selections from "../Selections/Selections";
import { Container } from "@material-ui/core";
import { searchTransform } from "../../utils";

const SEARCH_TYPES = [
  {
    value: "tracks",
    label: "Tracks",
    endpoint: "searchTracks"
  },
  {
    value: "artists",
    label: "Artists",
    endpoint: "searchArtists"
  }
];

const MAX_SELECTIONS = 5;

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [],
      searchResults: [],
      selectedSearchType: SEARCH_TYPES[0],
      searchValue: ""
    };

    // this.getTopArtists = this.getTopArtists.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchTypeChange = this.onSearchTypeChange.bind(this);
    this.onSearchResultClick = this.onSearchResultClick.bind(this);
    this.onRemoveSelection = this.onRemoveSelection.bind(this);
  }

  onSearchChange(value) {
    const { endpoint: searchEndpoint } = this.state.selectedSearchType;

    if (value) {
      fetch(
        `${
          process.env.REACT_APP_PROXY_URL
        }/spotify/${searchEndpoint}?q=${encodeURI(value)}`,
        { credentials: "include" }
      )
        .then(response => response.json())
        .then(searchResults =>
          this.setState({
            searchResults: searchTransform(searchResults),
            searchValue: value
          })
        );
    }
  }

  onSearchTypeChange(e) {
    const selectedSearchType = SEARCH_TYPES.find(
      type => type.value === e.target.value
    );
    this.setState({ selectedSearchType }, () =>
      this.onSearchChange(this.state.searchValue)
    );
  }

  onSearchResultClick(item) {
    const { selectedItems } = this.state;
    const itemExists = selectedItems.map(x => x.id).includes(item.id);

    if (!itemExists && selectedItems.length < MAX_SELECTIONS) {
      this.setState({
        selectedItems: [...selectedItems, item]
      });
    }
  }

  onRemoveSelection(item) {
    const selectedItems = this.state.selectedItems.filter(
      x => x.id !== item.id
    );
    this.setState({
      selectedItems
    });
  }

  componentDidMount() {
    fetch(`${process.env.REACT_APP_PROXY_URL}/auth/login/success`, {
      credentials: "include"
    })
      .then(response => {
        if (response.status === 200) return response.json();
        throw new Error("failed to authenticate user");
      })
      .then(responseJson => {
        this.setState({
          authenticated: true,
          user: responseJson.user
        });
      })
      .catch(e => {
        console.error(e);
        this.setState({
          authenticated: false,
          error: "Failed to authenticate user"
        });
      });
  }

  // getTopArtists() {
  //   fetch(`${process.env.REACT_APP_PROXY_URL}/spotify/topArtists`, {
  //     credentials: "include"
  //   })
  //     .then(response => response.json())
  //     .then(json => this.setState({ content: json }));
  // }

  render() {
    const { searchResults, selectedSearchType, searchValue } = this.state;
    return (
      <div className="App">
        <Header user={this.state.user} />
        <Container maxWidth="md">
          <Search
            value={searchValue}
            results={searchResults}
            onChange={this.onSearchChange}
            onSearchResultClick={this.onSearchResultClick}
            selectedSearchType={selectedSearchType}
            searchTypes={SEARCH_TYPES}
            onSearchTypeChange={this.onSearchTypeChange}
          ></Search>
          <Selections
            selections={this.state.selectedItems}
            handleDelete={this.onRemoveSelection}
          />
        </Container>
      </div>
    );
  }
}
export default Home;
