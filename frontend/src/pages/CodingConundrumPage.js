import { useEffect, useState, useRef } from 'react'

import IconButton from '@mui/material/IconButton'
import Input from '@mui/material/Input'
import FilledInput from '@mui/material/FilledInput'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import SmartToyTwoToneIcon from '@mui/icons-material/SmartToyTwoTone';

import TopNavBar from '../components/Nav'
import {
    Typography,
    Box,
    Grid,
    Container,
    Stack,
    Paper,
    Divider,
    TextField,
    Button,
    CircularProgress,
    Item,
    Avatar,
    Alert,
    Chip, Tooltip,
    Tabs,
    Tab,
} from '@mui/material'
import UserService from '../services/UserService'
import CodeEditor from "../components/Editor";

import { useNavigate } from 'react-router-dom'
import { GameDataService } from '../services/GameDataService'
import UserDataService from '../services/UserService'

const USER_POINTS_KEY_NAME = 'CodingConumdrumPoints'

export default function CodingConumdrumPage() {

    const [gptText, setGptText] = useState("Lorem sit deserunt aliquip excepteur ex do aliquip dolor esse labore elit magna mollit id. Commodo sit amet non deserunt tempor eiusmod excepteur minim minim sunt reprehenderit voluptate veniam. Amet dolor ea anim nostrud do occaecat dolor veniam sunt reprehenderit elit reprehenderit ea tempor. Sit officia laborum dolore eiusmod quis occaecat dolore tempor sunt ea.Consequat aute sit id reprehenderit proident amet ea laboris nulla quis id labore occaecat.Magna nostrud laborum ut eiusmod ipsum consequat tempor tempor consectetur proident veniam elit minim.Labore ipsum id nisi laboris tempor ad. minim amet dolor nulla exercitation commodo ad nulla excepteur non.Voluptate non veniam Lorem sit minim irure nisi veniam.Officia ad ex commodo dolor non sint ea dolor quis ipsum do ad.Nulla officia consequat elit eiusmod nostrud ipsum nisi adipisicing occaecat ipsum sint pariatur. Incididunt do dolor dolore dolore veniam adipisicing dolor amet pariatur.Ipsum qui nostrud dolor est ipsum enim non enim excepteur dolore.Eiusmod cillum excepteur non veniam pariatur amet magna dolor eu proident irure amet ipsum nulla.Non irure laboris cupidatat ut qui consectetur nisi.Sint proident commodo aute officia consectetur voluptate ad consectetur.Culpa Lorem ex dolor deserunt irure in magna quis.");
    const [channelTextData, setChannelTextData] = useState([]);
    const [timeRemaining, setTimeRemaining] = useState(120);
    const [gameStateManager, setGameStateManager] = useState(null);
    const [thisPlayer, setThisPlayer] = useState(null);
    const [gamePlayers, setGamePlayers] = useState([new UserData('john', '', '50', '10')]);
    const [backendConnection, setBackendConnection] = useState(null);

    const [tabValue, setTabValue] = useState(0);

    class GameStateManager {
        constructor(user) {
            this.user = user;
            this.connection = GameDataService.startConnection(this.responseHandler);
        }
        responseHandler(event) {
            let messages = event.data;
            console.log(messages)
            let data = JSON.parse(messages)
            if (data['prompt']) {
                setGptText(data['prompt'])
            }
            // console.log(messages)

            // setChannelTextData(messages['converted_stream_data'].map(i => i.content))
        }

        startNewRound() {
            console.log('start new round called')
            let message = `${this.user.username} would like to start a new round.`
            this.send(message)
        }

        joinRoom() {
            let message = `${this.user.username} has joined.`
            this.send(message)
        }
        leaveGame() {
            let message = `${this.user.username} has left.`
            this.send(message)
        }

        send(message, callback) {
            this.waitForConnection(() => {
                this.connection.send(message);
                if (typeof callback !== 'undefined') {
                    callback();
                }
            }, 1000);
        };

        waitForConnection(callback, interval) {
            if (this.connection.readyState === 1) {
                callback();
            } else {
                var that = this;
                // optional: implement backoff for interval here
                setTimeout(() => {
                    that.waitForConnection(callback, interval);
                }, interval);
            }
        };

    }

    function startNewRound() {
        gameStateManager.startNewRound();
    }


    function setTime() {
        // setInterval(() => {
        //     setTimeRemaining((i) => i - 1);
        // }, 1000)
    }

    function initiateGameState() {
        let userid = UserDataService.getUserId();
        let username = UserDataService.getUserName();
        let currentRoundPoints = 0;
        let userGlobalPoints = UserDataService.getUserDataValue(USER_POINTS_KEY_NAME);

        if (userGlobalPoints === null) {
            UserDataService.setUserDataValue(USER_POINTS_KEY_NAME, 0);
            userGlobalPoints = 0;
        }

        let thisPlayer = new UserData(username, userid, currentRoundPoints, userGlobalPoints);
        setThisPlayer(thisPlayer);
        setGamePlayers((v) => [thisPlayer, ...v])

        let gameStateManager = new GameStateManager(thisPlayer);
        setGameStateManager(gameStateManager);

        gameStateManager.joinRoom();

        window.addEventListener('beforeunload', () => {
            gameStateManager.leaveGame()
        })


    }

    useState(() => {
        initiateGameState();
        setTime();
    }, [])






    return <Box>
        <TopNavBar fixed></TopNavBar>

        <Grid container mt={8} >
            <Grid item xs={5}>
                <Stack
                    direction="column"
                // justifyContent="flex-end"
                // alignItems="center"
                >
                    <Stack direction="row"
                        justifyContent="space-around"
                        alignItems="center" spacing={2} pt={2} pr={10}>
                        <Typography variant='h5' ml={5} key='timeleft'>Time left: {timeRemaining} seconds</Typography>

                        <Stack direction="row" >
                            <Avatar alt="AI Overlord" sx={{ p: 1.5, m: 1 }}>
                                <SmartToyTwoToneIcon />
                            </Avatar>
                            <Typography variant='h6'>ChatGPT Says:</Typography>
                        </Stack>

                    </Stack>

                    {/* ChatGPT prompt question */}
                    <Box sx={{ height: '40vh', p: 5, overflowY: 'scroll' }} key={reactComponentKey()} >
                        <Typography sx={{ whiteSpace: 'pre-line' }}>{gptText}</Typography>
                    </Box>
                    <Button onClick={startNewRound}>Start New Round</Button>

                    <Box key={reactComponentKey()} >

                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={(event, value) => { setTabValue(value) }} aria-label="basic tabs example">
                                <Tab label="Players" {...a11yProps(0)} />
                                <Tab label="Messages" {...a11yProps(1)} />
                            </Tabs>
                        </Box>
                        <TabPanel value={tabValue} index={0} >
                            <Box sx={{ pl: 5, height: '20vh', overflowY: 'auto' }} key={reactComponentKey()} >
                                {
                                    gamePlayers.map((data) => userAvatarDisplay(data, reactComponentKey()))
                                }
                            </Box>
                        </TabPanel>
                        <TabPanel value={tabValue} index={1}>
                            <Box sx={{ pl: 5, height: '20vh', overflowY: 'auto' }} key={reactComponentKey()} >
                                {
                                    channelTextData.map((i) => {
                                        return <Typography key={reactComponentKey()}>{i}</Typography>
                                    })
                                }
                            </Box>
                        </TabPanel>
                    </Box>

                </Stack>
            </Grid>

            {/* right half of the page */}
            <Grid item xs={7}>
                <CodeEditor />
            </Grid>

        </Grid>
    </Box >


}


const userAvatarDisplay = (userData, key) => {
    return <Stack direction="row" spacing={2} key={key}>
        <Tooltip title={userData.username} >
            <Avatar sx={{ mb: 2 }}>userData.username</Avatar>
        </Tooltip>
        <Chip label={`${userData.roundPoints} points | ${userData.totalPoints} total`} variant="outlined" />
    </Stack>
}

class UserData {
    constructor(username, userid, roundPoints, totalPoints) {
        this.username = username
        this.userid = userid
        this.roundPoints = roundPoints
        this.totalPoints = totalPoints

    }
}

let _reactComponentKey = 0;
const reactComponentKey = () => {
    _reactComponentKey += 1;
    return _reactComponentKey;
}


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component={'span'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}