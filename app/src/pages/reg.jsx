import { Link } from "react-router-dom";
import { Alert, Button, Form, Row, Col, Stack} from "react-bootstrap";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Register = () => {

    const {registerInfo, updateRegisterInfo, registerUser, registerError, isRegisterLoading} = useContext(AuthContext)
    return ( <>
        
        <Form onSubmit={registerUser}>
                <Stack gap={3}>
                    <h2>Register</h2>
                    <div>
                    <h3>Name</h3>
                    <Form.Control type="text" placeholder="" onChange={(e) => updateRegisterInfo
                        ({...registerInfo, tag: e.target.value})}/>
                    </div>
                    <div>
                    <h3>Email</h3>
                    <Form.Control type="text" placeholder="" onChange={(e) => updateRegisterInfo
                        ({...registerInfo, email: e.target.value})}/>
                    </div>
                    <div>
                    <h3>Password</h3>
                    <Form.Control type="text" placeholder="" onChange={(e) => updateRegisterInfo
                        ({...registerInfo, password: e.target.value})}/>
                    </div>
                    <div>
                    <h3>Token</h3>
                    <Form.Control type="text" placeholder="" onChange={(e) => updateRegisterInfo
                        ({...registerInfo, regToken: e.target.value})}/>
                    </div>
                    <Button className="logger-btn" variant="primary" type="submit">
                        {isRegisterLoading ? "Loading..." : "Join Now"}
                    </Button>
                        {
                            registerError?.error && 
                            <Alert variant="danger"><p>{registerError.message}</p></Alert>
                        }
                    <Link to="/Login">I already have an account</Link>
                </Stack>

        </Form>
    </>);
}
 
export default Register;