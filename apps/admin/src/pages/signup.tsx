import React, { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import Input from '../components/elements/Input'
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
import { Organisation } from '../../../api/src/modules/organisations/entities/organisation.entity'
import { useMutation } from 'react-query'
import { AuthSignupDto, CreateUserDto } from '../../../api-sdk/types'
import { AuthContext } from '../context/Auth.context'

const organisationTypes = Object.keys(OrganisationType).map((key) => {
  return {
    label: key,
    value: OrganisationType[key]
  }
})

const SignupPage = () => {
  const { api } = useContext(AuthContext)

  const words = ['Business', 'Building', 'Team', 'School']

  const { handleSubmit, register, control, watch } = useForm({
    defaultValues: {
      first_name: undefined,
      last_name: undefined,
      company: undefined,
      email: undefined,
      password: undefined,
      agree_to_terms: undefined,
      subscribe: undefined,
      type: undefined,
      type_other: undefined
    }
  })

  const other = watch('type')

  const create: ApiMutationResult<AuthSignupDto> = useMutation(
    (payload: CreateUserDto) => api.signUp(payload)
  )

  const { errors, isError, errorMessage, clearErrors } = useApiErrors(
    create.isError,
    create.error
  )

  async function submit(payload) {
    console.log(payload)
    console.log(new Date().toISOString())
  }

  return (
    <Signup title="Sign up">
      <div className="img-overlay" />
      <div className="intro">
        <div className="intro-content">
          <Logo />
          <h1>
            Fitlink for your
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
          <p>
            Fitlink helps your employees focus on{' '}
            <strong>healthier living</strong>.
          </p>
          <p>Healthier means happier.</p>
          <h2>
            Sign up for a <strong>completely free, 30 day trial</strong>.
          </h2>
          <p>
            <a
              className="link"
              href="https://fitlinkapp.com/pricing"
              target="_blank"
              rel="noopener noreferrer">
              View pricing details <IconArrowRight />
            </a>
          </p>

          <div className="personal">
            <h3>Fitlink is free for Personal Use</h3>
            <p>
              Fitlink lets you create personal health goals and track them
              daily, giving you the power to lead a healthier life.
            </p>
            <div className="flex">
              <a
                className="badge"
                href="https://apps.apple.com/gb/app/fitlink-app/id970460487"
                target="_blank"
                rel="noopener noreferrer">
                <img
                  src="/img/app-store-badge.svg"
                  alt="Download on the App Store"
                />
              </a>
              <a
                className="badge"
                href="https://play.google.com/store/apps/details?id=app.fitlink"
                target="_blank"
                rel="noopener noreferrer">
                <img
                  src="/img/google-play-badge.png"
                  alt="Get it on Google Play"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="main">
          <div className="mb-4 w-100">
            <img
              src="/img/illustration-sports.png"
              alt="Sport Illustrations"
              className="illustration"
            />
          </div>
          <div className="mb-2">
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
            <form onSubmit={handleSubmit(submit)}>
              <div className="row">
                <div className="col-12 col-lg-6">
                  <Input
                    label="First name"
                    name="first_name"
                    className="in-row"
                    register={register('first_name')}
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <Input
                    label="Last name"
                    name="last_name"
                    className="in-row"
                    register={register('last_name')}
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-12 col-lg-6">
                  <Input
                    label="Company / Organisation name"
                    name="company"
                    register={register('company')}
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
              />
              <Input
                label="Password"
                type="password"
                name="password"
                register={register('password')}
              />
              <Checkbox
                register={register('agree_to_terms')}
                name="terms"
                showSwitch={false}
                label="I agree to the <a href='https://fitlinkapp.com/terms-and-conditions' target='_blank' rel='noopener noreferrer'>Fitlink terms and conditions</a>"
              />
              <Checkbox
                register={register('subscribe')}
                name="newsletter"
                showSwitch={false}
                label="Subscribe to our newsletter for useful tips about promoting wellness"
              />
              <div className="text-right">
                <Button label="Start trial" className="pointer" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </Signup>
  )
}

export default SignupPage
