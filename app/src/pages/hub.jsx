import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Hub = () => {
    const {user, logoutUser} = useContext(AuthContext) 
    return ( <div className="hub">
        <div className="hub-head">
            <h1>{user.tag}'s Hub</h1>
        </div>
        <div className="hub-torso">

        </div>
    </div> );
}
 
export default Hub;