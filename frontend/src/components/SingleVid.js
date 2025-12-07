import React from "react";

import { useParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useLocation } from "react-router-dom/";

const SingleVid = () => {
  const Location = useLocation();
  //console.log("check",Location.state.name)
  const { id, name } = Location.state || {};
  const { vidid } = useParams();
  console.log("uservid", id);
  const MyMeetings = async (e) => {
    const appID = 443024606;
    const serverSecret = "f86bd835a572f7be8b746dc57d5eb471";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      vidid,
      id,
      name
    );

    const ZC = ZegoUIKitPrebuilt.create(kitToken);
    ZC.joinRoom({
      container: e,

      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: false,
    });
  };

  return (
    <div>
      <div ref={MyMeetings} />
    </div>
  );
};

export default SingleVid;
