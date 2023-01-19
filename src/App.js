import SignIn from "./Components/SignIn.js";
import Storage from "./Components/Storage.js";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./Components/Firebase";
import { css } from "@emotion/css";

function App() {
  const [user] = useAuthState(auth);

  return (
    <div
      className={css`
        background-color: #ebf0f6;
        height: 100vh;
      `}
    >
      {user ? <Storage /> : <SignIn />}
    </div>
  );
}

export default App;
