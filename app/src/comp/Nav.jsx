import { Stack } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useCallback, useContext ,useState } from "react";
import { AuthContext } from "../context/AuthContext";




const Nav = () => {
    const {user, logoutUser} = useContext(AuthContext)
    const [hide, setHide] = useState(false)

    let path = useLocation()
    console.log(path.pathname)
    let pathRn = path.pathname
    let uCheck = false;
    if(user == null)
        uCheck = true

    if(pathRn == '/U' || pathRn == '/info' || uCheck == true) {
        if(hide == false)
            setHide(true)

    } else {
        if(hide == true)
            setHide(false)
    }


    return ( <>

    { hide == false &&
        <Stack direction="horizontal" className="nav">
        <div className="nav-wrap">
            <div className="logo">
            <Link to='/'>Home</Link>
            </div>
            {
            user && (<>
                <Link to="/U">{user.tag}</Link>
                </>)
            }
            {!user && (<>
                <div className="log-btn">
                    <Link to='/Login'> Login </Link>
                    /
                    <Link to='/Register'> Register </Link>
                 </div>
            </>)}
        </div>
    </Stack>
    }
    {hide == true && 
        <Stack direction="horizontal" className="no-nav">
            <div className="home-btn">
                <Link to='/'>  <i class="material-icons">wb_cloudy</i></Link>
            </div>
        </Stack>
    }
        

    </> );
}
 
export default Nav;
