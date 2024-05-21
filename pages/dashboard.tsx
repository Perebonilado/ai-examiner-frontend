import GenerateQuestionsForm from '@/@modules/home/GenerateQuestionsForm'
import AppHead from '@/@shared/components/AppHead'
import AppLayout from '@/layouts/AppLayout'
import { NextPage } from 'next'
import React from 'react'

const Dashboard:NextPage = () => {
  return (
    <AppLayout>
      <AppHead title='Dashboard'/>
        <GenerateQuestionsForm />
    </AppLayout>
  )
}

export default Dashboard