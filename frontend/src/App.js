import { Button } from "@chakra-ui/react";
import "./App.css";
import { Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import Chatpage from "./Pages/Chatpage";
import SingleVid from "./components/SingleVid";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      <Route path="/chats" component={Chatpage} />
      <Route path="/single/:vidid" component={SingleVid} />
      {/* <Route path="/group/:vidid" component={GroupVid} /> */}
    </div>
  );
}

export default App;
