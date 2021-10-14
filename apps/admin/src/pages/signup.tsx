import React, { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import Input from '../components/elements/Input'
import Feedback from '../components/elements/Feedback'
import Checkbox from '../components/elements/Checkbox'
import Button from '../components/elements/Button'
import Logo from '../components/elements/Logo'
import Signup from '../components/layouts/Signup'
import { Typewriter } from 'react-simple-typewriter'
import IconArrowRight from '../components/icons/IconArrowRight'
import { Controller, useForm } from 'react-hook-form'
import { OrganisationType } from '@fitlink/api/src/modules/organisations/organisations.constants'
import Select from '../components/elements/Select'
import useApiErrors from '../hooks/useApiErrors'
import { ApiMutationResult } from '../../../common/react-query/types'
import { useMutation } from 'react-query'
import {
  AuthSignupDto,
  CreateUserWithOrganisationDto
} from '../../../api-sdk/types'
import { AuthContext } from '../context/Auth.context'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'

const organisationTypes = Object.keys(OrganisationType).map((key) => {
  return {
    label: key,
    value: OrganisationType[key]
  }
})

const SignupPage = () => {
  const { api } = useContext(AuthContext)
  const router = useRouter()

  const words = [
    'people',
    'business',
    'building',
    'team',
    'school',
    'transport'
  ]

  const { handleSubmit, register, control, watch } = useForm({
    defaultValues: {
      name: undefined,
      company: undefined,
      email: undefined,
      password: undefined,
      agree_to_terms: undefined,
      subscribe: undefined,
      type: organisationTypes[0].value,
      type_other: undefined
    }
  })

  const other = watch('type')

  const create: ApiMutationResult<AuthSignupDto> = useMutation(
    (payload: CreateUserWithOrganisationDto) =>
      api.signUpWithOrganisation(payload)
  )

  const {
    errors,
    isError,
    errorMessage,
    clearErrors,
    setErrors
  } = useApiErrors(create.isError, create.error)

  async function submit(payload) {
    payload.date = new Date().toISOString()

    if (!payload.agree_to_terms) {
      setErrors({
        agree_to_terms: 'You must agree to our terms to continue'
      })
      return
    }

    clearErrors()

    try {
      await toast.promise(create.mutateAsync(payload), {
        error: <b>Error</b>,
        loading: <b>Signing you up...</b>,
        success: <b>Account created!</b>
      })

      router.push('/start')
    } catch (e) {}
  }

  return (
    <Signup title="Sign up">
      <div className="img-overlay" />
      <div className="primary" />
      <div className="flex">
        <div className="intro">
          <div className="intro-content">
            <Logo />
            <h1>
              Healthy
              <div className="color-primary">
                <Typewriter
                  loop
                  cursor
                  cursorStyle="|"
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={1000}
                  words={words}
                />
              </div>
            </h1>
            <h2>
              Billing is monthly and you don’t need a credit card to sign up.
              You'll only be charged for users once they've joined your team.
            </h2>
            <ul>
              <li>14 day free trial</li>
              <li>Dashboard with team insights and analytics</li>
              <li>Custom team leagues</li>
              <li>Create your own rewards</li>
              <li>Access to sponsored rewards</li>
              <li>Team based activities</li>
              <li>Custom branded website</li>
            </ul>
            <p>
              <a
                className="link"
                href="https://fitlinkapp.com/pricing"
                target="_blank"
                rel="noopener noreferrer">
                View pricing details <IconArrowRight />
              </a>
            </p>
          </div>
        </div>
        <div className="content">
          <div className="main">
            <div className="">
              <h2 className="text-center">Create an Account</h2>
              <p className="text-center">
                <Link href="/login">
                  <a className="link">
                    I already have an account <IconArrowRight />
                  </a>
                </Link>
              </p>
            </div>
            <div className="form w-100">
              {errorMessage && <Feedback message={errorMessage} type="error" />}
              <form onSubmit={handleSubmit(submit)}>
                <div className="row">
                  <div className="col-12 col-lg-12">
                    <Input
                      label="Full name"
                      name="name"
                      className="in-row"
                      placeholder="Your name and surname"
                      register={register('name')}
                      error={errors.name}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 col-lg-6">
                    <Input
                      label="Company / Organisation name"
                      name="company"
                      register={register('company')}
                      error={errors.company}
                    />
                  </div>
                  <div className="col-12 col-lg-6">
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => {
                        return (
                          <Select
                            classNamePrefix="addl-class"
                            options={organisationTypes}
                            label="Type of organisation"
                            inline={false}
                            id="type"
                            defaultValue={organisationTypes[0]}
                            onChange={(option) => {
                              if (option) {
                                field.onChange(option.value)
                              }
                            }}
                            onBlur={field.onBlur}
                          />
                        )
                      }}
                    />
                  </div>
                </div>
                {other === OrganisationType.Other && (
                  <Input
                    register={register('type_other')}
                    name="type_other"
                    placeholder="Type of organisation"
                    error={errors.type_other}
                  />
                )}
                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  register={register('email')}
                  error={errors.email}
                />
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  register={register('password')}
                  error={errors.password}
                />
                <Checkbox
                  register={register('agree_to_terms')}
                  name="terms"
                  showSwitch={false}
                  label="I agree to the <a href='https://fitlinkapp.com/terms-and-conditions' target='_blank' rel='noopener noreferrer'>Fitlink terms and conditions</a>"
                  error={errors.agree_to_terms}
                />
                <Checkbox
                  register={register('subscribe')}
                  name="newsletter"
                  showSwitch={false}
                  label="Subscribe to our newsletter for useful tips about promoting wellness"
                />
                <div className="text-right">
                  <Button
                    label="Start trial"
                    className="pointer"
                    type="submit"
                    disabled={create.isLoading}
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Signup>
  )
}

export default SignupPage
