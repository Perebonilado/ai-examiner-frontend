import GenerateQuestionsForm from '@/@modules/home/GenerateQuestionsForm'
import AppHead from '@/@shared/components/AppHead'
import AppLayout from '@/layouts/AppLayout'
import { NextPage } from 'next'
import React from 'react'

const NewDocument:NextPage = () => {
  return (
    <AppLayout>
      <AppHead title='New Document'/>
        <GenerateQuestionsForm />
    </AppLayout>
  )
}

export default NewDocument