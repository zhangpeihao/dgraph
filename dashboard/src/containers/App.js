import React from "react";
import { connect } from "react-redux";
import screenfull from "screenfull";
import { Alert } from "react-bootstrap";

import NavbarContainer from "../containers/NavbarContainer";
import PreviousQueryListContainer from "./PreviousQueryListContainer";
import Editor from "./Editor";
import Response from "./Response";
import {
  updateFullscreen,
  getQuery,
  runQuery,
  handleUpdateInitialQuery,
  queryFound,
  initApp
} from "../actions";

import "../assets/css/App.css";

class App extends React.Component {
  enterFullScreen = updateFullscreen => {
    if (!screenfull.enabled) {
      return;
    }

    document.addEventListener(screenfull.raw.fullscreenchange, () => {
      updateFullscreen(screenfull.isFullscreen);
    });
    screenfull.request(document.getElementById("response"));
  };

  render = () => {
    return (
      <div>
        <NavbarContainer />
        <div className="container-fluid">
          <div className="row justify-content-md-center">
            <div className="col-sm-12">
              <div className="col-sm-8 col-sm-offset-2">
                {!this.props.found &&
                  <Alert
                    ref={alert => {
                      this.alert = alert;
                    }}
                    bsStyle="danger"
                    onDismiss={() => {
                      this.props.queryFound(true);
                    }}
                  >
                    Couldn't find query with the given id.
                  </Alert>}
              </div>
              <div className="col-sm-5">
                <Editor />
                <PreviousQueryListContainer xs="hidden-xs" />
              </div>
              <div className="col-sm-7">
                <label style={{ marginLeft: "5px" }}> Response </label>
                {screenfull.enabled &&
                  <div
                    title="Enter full screen mode"
                    className="pull-right App-fullscreen"
                    onClick={() => this.enterFullScreen(this.props.handleUpdateFullscreen)}
                  >
                    <span
                      className="App-fs-icon glyphicon glyphicon-glyphicon glyphicon-resize-full"
                    />
                  </div>}
                <Response />
                <PreviousQueryListContainer xs="visible-xs-block" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  componentDidMount = () => {
    const { initApp, handleRunQuery, handleGetQuery, location, match: { params }, currentQuery } = this.props;

    initApp();

    // If id param is present, fetch the query
    if (params.id) {
      getQuery(params.id);
    }

    // If sessionId query param is present, fetch the query for that session
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get('sessionId');
    if (sessionId) {
      handleGetQuery(sessionId, 'session').then(() => {
          console.log('yeah');
          return handleRunQuery(currentQuery);
        })
        .catch(e => {
          // TODO: move error handling out of getQuery and runQuery to here
          console.log(e);
        });
    }
  };

  componentWillReceiveProps = nextProps => {
    if (!nextProps.found) {
      // Lets auto close the alert after 2 secs.
      setTimeout(
        () => {
          this.props.queryFound(true);
        },
        3000
      );
    }
  };
}

const mapStateToProps = state => ({
  found: state.share.found,
  currentQuery: state.query.text
});

const mapDispatchToProps = dispatch => ({
  handleUpdateFullscreen: fs => {
    dispatch(updateFullscreen(fs));
  },
  handleGetQuery: (id, idType) => {
    return dispatch(getQuery(id, idType));
  },
  handleRunQuery: (query) => {
    return dispatch(runQuery(query));
  },
  queryFound: found => {
    dispatch(queryFound(found));
  },
  initApp: () => {
    dispatch(initApp());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
