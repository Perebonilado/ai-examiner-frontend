import GenerateQuestionsForm from '@/@modules/home/GenerateQuestionsForm'
import AppLayout from '@/layouts/AppLayout'
import { NextPage } from 'next'
import React from 'react'

const Dashboard:NextPage = () => {
  return (
    <AppLayout>
        <GenerateQuestionsForm />
    </AppLayout>
  )
}

export default Dashboard