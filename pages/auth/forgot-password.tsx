import ForgotPasswordForm from '@/@modules/auth/ForgotPasswordForm'
import AppHead from '@/@shared/components/AppHead'
import { NextPage } from 'next'
import React from 'react'

const ForgotPassword:NextPage = () => {
  return (
    <>
    <AppHead title="Forgot Passord" />
    <ForgotPasswordForm />
  </>
  )
}

export default ForgotPassword