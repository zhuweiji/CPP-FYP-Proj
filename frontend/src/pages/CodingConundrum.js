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
    Chip, Tooltip
} from '@mui/material'
import UserService from '../services/UserService'
import CodeEditor from "../components/Editor";

import { useNavigate } from 'react-router-dom'

export default function CodingConumdrumPage() {

    const [gptText, setGptText] = useState("Lorem sit deserunt aliquip excepteur ex do aliquip dolor esse labore elit magna mollit id. Commodo sit amet non deserunt tempor eiusmod excepteur minim minim sunt reprehenderit voluptate veniam. Amet dolor ea anim nostrud do occaecat dolor veniam sunt reprehenderit elit reprehenderit ea tempor. Sit officia laborum dolore eiusmod quis occaecat dolore tempor sunt ea.Consequat aute sit id reprehenderit proident amet ea laboris nulla quis id labore occaecat.Magna nostrud laborum ut eiusmod ipsum consequat tempor tempor consectetur proident veniam elit minim.Labore ipsum id nisi laboris tempor ad. minim amet dolor nulla exercitation commodo ad nulla excepteur non.Voluptate non veniam Lorem sit minim irure nisi veniam.Officia ad ex commodo dolor non sint ea dolor quis ipsum do ad.Nulla officia consequat elit eiusmod nostrud ipsum nisi adipisicing occaecat ipsum sint pariatur. Incididunt do dolor dolore dolore veniam adipisicing dolor amet pariatur.Ipsum qui nostrud dolor est ipsum enim non enim excepteur dolore.Eiusmod cillum excepteur non veniam pariatur amet magna dolor eu proident irure amet ipsum nulla.Non irure laboris cupidatat ut qui consectetur nisi.Sint proident commodo aute officia consectetur voluptate ad consectetur.Culpa Lorem ex dolor deserunt irure in magna quis.");

    return <>
        <Grid container >
            <Grid item xs={5}>
                <Stack
                    direction="column"
                // justifyContent="flex-end"
                // alignItems="center"
                >
                    <Stack direction="row"
                        // justifyContent="space-between"
                        alignItems="center" spacing={2}>
                        <Avatar alt="AI Overlord" sx={{ p: '1rem', m: 1 }}>
                            <SmartToyTwoToneIcon />
                        </Avatar>
                        <Typography variant='h5'>ChatGPT Says:</Typography>

                    </Stack>

                    <Box sx={{ height: '50vh', p: 5 }} >
                        <Typography >{gptText}</Typography>
                    </Box>

                    <Box sx={{ height: '45vh', pl: 10 }}>
                        <Stack direction="row" spacing={2}>
                            <Tooltip title="wzhu002">
                                <Avatar sx={{ mb: 2 }}>H</Avatar>
                            </Tooltip>
                            <Chip label="10 points | 1000 total" variant="outlined" />
                        </Stack>

                        <Avatar sx={{ mb: 2 }}>H</Avatar>

                        <Avatar sx={{ mb: 2 }}>H</Avatar>
                        <Avatar sx={{ mb: 2 }}>H</Avatar>
                        <Avatar sx={{ mb: 2 }}>H</Avatar>

                    </Box>
                </Stack>
            </Grid>
            <Grid item xs={7}>
                <CodeEditor />
            </Grid>
        </Grid>
    </>
}