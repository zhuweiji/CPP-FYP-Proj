import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'

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
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';

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

import {
    red, grey, purple, deepPurple, indigo, blue, lightBlue, cyan, teal, green, lightGreen, lime, yellow, amber, orange
} from '@mui/material/colors';


import UserService from '../services/UserService'
import CodeEditor from "../components/Editor";

import { useNavigate } from 'react-router-dom'
import { GameDataService } from '../services/GameDataService'
import UserDataService from '../services/UserService'

const USER_POINTS_KEY_NAME = 'CodingConumdrumPoints'

export default function CodingConumdrumPage() {

    const [gptText, setGptText] = useState("");
    const [channelTextData, setChannelTextData] = useState([]);
    const [gameStateManager, setGameStateManager] = useState(null);
    const [thisPlayer, setThisPlayer] = useState(null);
    const [gamePlayers, setGamePlayers] = useState([new UserData('john', '', '50', '10')]);
    const [loadingGPT, setLoadingGPT] = useState(false);

    const [tabValue, setTabValue] = useState(0);

    const timerRef = useRef();

    class GameStateManager {
        constructor(user) {
            this.user = user;
            this.connection = GameDataService.startConnection(this.websocketIncomingMessageHandler);
            this.connection.onerror = (e) => {
                alert('Could not establish a connection with the compiler server. Please refresh the page or try again later.')
            }
        }
        websocketIncomingMessageHandler(event) {
            let messages = event.data;
            console.log(messages)
            let data = JSON.parse(messages)
            if (data['RoundCreatedMessage']) {
                let contents = data['RoundCreatedMessage']
                let start_time = new Date(parseFloat(contents['start_time']) * 1000)
                let round_duration = parseInt(contents['round_duration'])
                let end_time = new Date(start_time.getTime() + round_duration * 1000)

                let seconds_left = parseInt(
                    (end_time.getTime() - new Date().getTime()) / 1000);

                timerRef.current.startTimer(seconds_left);
                setGptText(contents['prompt'])
                setLoadingGPT(false);
            }
            else {
                let contents = data[Object.keys(data)[0]]
                let newChannelData = contents['content'];
                setChannelTextData((i) => [...i, newChannelData])
            }
        }

        // game-specific methods that update the state on the backend

        startNewRound() {
            console.log('start new round called')
            setLoadingGPT(true);
            let message = `[gamestate]: ${this.user.username} would like to start a new round.`
            this.send(message)
        }

        joinRoom() {
            let message = `[gamestate]: ${this.user.username} has joined.`
            this.send(message)
        }
        leaveGame() {
            let message = `[gamestate]: ${this.user.username} has left.`
            this.send(message)
        }

        // wrappers around WebSocket connections to improve reliability (should these go somewhere else?)

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

    useEffect(() => {
        initiateGameState();
    }, [])

    return <Box>
        <TopNavBar fixed></TopNavBar>

        <Grid container mt={8} >
            <Grid item xs={5}
                sx={{
                    // backgroundColor: grey[800],
                    // color: "#e8eaed",
                }}
            >
                <Stack
                    direction="column"
                // justifyContent="flex-end"
                // alignItems="center"
                >
                    <Stack direction="row"
                        justifyContent="space-between"
                        // alignItems="center"
                        spacing={2} pt={5} pr={10}>
                        <TimerComponent ref={timerRef} />

                        {
                            loadingGPT && <CircularProgress color="secondary" />
                        }



                        <Stack direction="row" >
                            {/* <Avatar alt="AI Overlord" sx={{ p: 1.5, m: 1, bgcolor: red[600] }}>
                                <SmartToyTwoToneIcon />
                            </Avatar> */}
                            {/* <Typography fontFamily='PT Serif' variant='h6'>ChatGPT Says:</Typography> */}
                        </Stack>

                    </Stack>

                    {/* ChatGPT prompt question */}
                    <Box sx={{ height: '40vh', p: 5, overflowY: 'scroll' }} key={reactComponentKey()} >
                        <Typography fontFamily='Open Sans' sx={{ whiteSpace: 'pre-line' }}>
                            {gptText || "Press Start New Round to start a round when you're ready"}
                        </Typography>
                    </Box>
                    <Button onClick={startNewRound}>Start New Round</Button>

                    <Box key={reactComponentKey()}  >

                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tabValue} onChange={(event, value) => { setTabValue(value) }} aria-label="basic tabs example">
                                <Tab label="Messages" {...a11yProps(0)} />
                                <Tab label="Players" {...a11yProps(1)} />
                            </Tabs>
                        </Box>
                        <TabPanel value={tabValue} index={0} >
                            <Box sx={{ height: '20vh', overflowY: 'auto' }} key={reactComponentKey()} >
                                {
                                    channelTextData.map((i) => {
                                        return <Box mr={5} minHeight='1.3rem' key={reactComponentKey()}>
                                            <Typography align='center' fontFamily="Segoe UI" key={reactComponentKey()}
                                                sx={{
                                                    color: '#fff',
                                                    backgroundColor: "#3f51b5",
                                                    borderTopLeftRadius: 5,
                                                    borderTopRightRadius: 10,
                                                    borderBottomLeftRadius: 5,
                                                    pl: 2,
                                                    pr: 2,
                                                    mb: 1,
                                                    fontSize: '0.8rem',
                                                }}
                                            >{i}</Typography>
                                        </Box>

                                    })
                                }
                            </Box>
                        </TabPanel>
                        <TabPanel value={tabValue} index={1} >
                            <Box sx={{ pl: 5, height: '20vh', overflowY: 'auto' }} key={reactComponentKey()} >
                                {
                                    gamePlayers.map((data) => userAvatarDisplay(data, reactComponentKey()))
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
            <Avatar sx={{ mb: 2, bgcolor: grey[900] }} ><AccessibilityNewIcon /></Avatar>
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

const TimerComponent = forwardRef((props, ref) => {
    const [timeRemaining, setTimeRemaining] = useState(120);

    useImperativeHandle(ref, () => ({
        startTimer(seconds) {
            setTimeRemaining(seconds)
            let intervalId = setInterval(() => {
                setTimeRemaining((i) => {
                    if (i - 1 <= 0) {
                        clearInterval(intervalId);
                    }
                    return i - 1;
                });

            }, 1000)
        }
    }))


    return <Stack direction="column" >
        <Typography fontFamily='PT Serif' ml={5} key='timeleft'>Time remaining this round:</Typography>
        <Typography fontFamily='Segoe UI' variant='h5' ml={5} key='timeleft2'>{timeRemaining} seconds</Typography>
    </Stack>

})

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}