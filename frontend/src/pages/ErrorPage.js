import { useRouteError } from "react-router-dom";
import { Typography, Container, Grid } from '@mui/material';


export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

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
                        <Typography variant="h2">Oops!</Typography>
                        <p>Sorry, an unexpected error has occurred.</p>
                        <p>
                            Error: <i>{error.statusText || error.message}</i>
                        </p>
                    </Container>
                </div>
            </Grid>

        </Grid>

    );
}