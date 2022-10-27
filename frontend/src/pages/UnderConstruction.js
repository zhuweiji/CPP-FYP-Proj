import { Typography, Container, Grid, Button } from '@mui/material';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';

import { useNavigate } from 'react-router-dom';
import { useHistory } from "react-router-dom";

import { useState, useEffect, useCallback } from "react";
import EngineeringIcon from '@mui/icons-material/Engineering';

export default function UnderConstruction() {
    const navigate = useNavigate();
    const redirectToHomePage = useCallback(() => navigate('/', { replace: false }), [navigate]);
    const [timeLeft, setTimeLeft] = useState(5);

    useEffect(() => {
        if (timeLeft === 0) {
            setTimeLeft(null);
            redirectToHomePage();
        }

        const intervalId = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
    }, [timeLeft]);

    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            style={{ minHeight: '100vh' }}
        >

            <Grid item xs={3}>
                <div id="error-page">
                    <Container>
                        <Typography variant="h1">Sorry!</Typography>
                        <br />

                        <Typography variant="h2"> <EngineeringIcon fontSize='large'/> We're still building this page. Please check back again soon.</Typography>
                        <br/>
                        <br />
                        <br />
                        <br />

                        <Typography variant="p">Redirecting you back to the home page in {timeLeft} seconds</Typography>
                        <br/>
                        <Button onClick={() => navigate(-1)}> <KeyboardReturnIcon /> Or click here to return to your previous page  </Button>
                    </Container>
                </div>
            </Grid>

        </Grid>

    );
}