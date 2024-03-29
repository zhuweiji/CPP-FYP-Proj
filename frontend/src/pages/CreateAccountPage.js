import './css/CreateAccountPage.css'

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
  CircularProgress
} from '@mui/material'
import UserService from '../services/UserService'

import { useNavigate } from 'react-router-dom'

export default function LoginPage (props) {
  const [showPassword, setShowPassword] = useState(false)

  const usernameRef = useRef()
  const passwordRef = useRef()

  const [formDisabled, setFormDisabled] = useState(false)
  const [createResultMessage, setCreateResultMessage] = useState('')

  const handleClickShowPassword = () => setShowPassword(show => !show)

  const handleMouseDownPassword = event => {
    event.preventDefault()
  }

  const navigate = useNavigate()

  async function handleSubmit () {
    let userid = usernameRef.current.value
    let password = passwordRef.current.value

    setFormDisabled(true)

    let result = await UserService.create_account(userid)
    if (result) {
      if (result.error && result.error === 'username already exists') {
        setCreateResultMessage(
          'Sorry, this username already exists. Please try another.'
        )
      } else {
        UserService.setUserId(result['user_id'])
        UserService.setUserName(result['username'])
        setCreateResultMessage('User created!')
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 1000)
      }
    } else {
      setCreateResultMessage('An error occured. Please try again.')
    }
    setFormDisabled(false)
  }

  function submitIfKeydownEnter (e) {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  const loginBgImg = require(`../static/login_marble.jpg`)

  return (
    <>
      <TopNavBar></TopNavBar>

      <Grid
        container
        spacing={0}
        direction='column'
        alignItems='center'
        justifyContent='center'
        style={{
          height: '92vh',
          backgroundImage: `url(${loginBgImg}), linear-gradient(rgba(155, 155, 155, 0.3), rgba(155, 155, 155, 0.6))`,
          overflowY: 'clip',
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundBlendMode: 'overlay'
        }}
      >
        <Grid item xs={3}>
          <Typography variant='h2'>Create Account</Typography>

          <InputLabel htmlFor='username-input' sx={{ mt: '8%' }}>
            Username
          </InputLabel>
          <Input
            id='username-input'
            inputRef={usernameRef}
            size='medium'
            label='Username'
            color='secondary'
            sx={{ width: '50ch' }}
            onKeyDown={submitIfKeydownEnter}
            disabled={formDisabled}
          />

          <InputLabel htmlFor='standard-adornment-password' sx={{ mt: '8%' }}>
            Password (Not currently used)
          </InputLabel>
          <Input
            id='outlined-adornment-password'
            inputRef={passwordRef}
            sx={{ width: '50ch' }}
            variant='standard'
            type={showPassword ? 'text' : 'password'}
            endAdornment={
              <InputAdornment position='end'>
                <IconButton
                  aria-label='toggle password visibility'
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge='end'
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label='Password'
            disabled={formDisabled || true}
          />

          <Stack
            direction='row'
            justifyContent='flex-end'
            alignItems='center'
            sx={{ mt: '5%' }}
            spacing={5}
          >
            <Typography variant='p'>{createResultMessage}</Typography>
            {formDisabled && <CircularProgress size='1rem' hidden />}
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={formDisabled}
            >
              Create Account
            </Button>
          </Stack>

          <Divider sx={{ pb: '3rem' }} />
        </Grid>
      </Grid>
    </>
  )
}
