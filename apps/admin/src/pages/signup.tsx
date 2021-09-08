import React, { useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import Input from '../components/elements/Input'
import Checkbox from '../components/elements/Checkbox'
import Button from '../components/elements/Button'
import Logo from '../components/elements/Logo'
import Signup from '../components/layouts/Signup'
import { Typewriter } from 'react-simple-typewriter'
import IconArrowRight from '../components/icons/IconArrowRight'

const SignupPage = () => {

  const words = ['Business', 'Building', 'Team', 'School']

  return(
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
          <p>
            Healthier means happier.
          </p>
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
            <h3>
              Fitlink is free for Personal Use
            </h3>
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
                <img src="/img/app-store-badge.svg" alt="Download on the App Store" />
              </a>
              <a
                className="badge"
                href="https://play.google.com/store/apps/details?id=app.fitlink"
                target="_blank"
                rel="noopener noreferrer">
                <img src="/img/google-play-badge.png" alt="Get it on Google Play" />
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
            <h2
              className="text-center">
              Create an Account
            </h2>
            <p className="text-center">
              <Link href="/login">
                <a className="link">
                  I already have an account <IconArrowRight />
                </a>
              </Link>
            </p>
          </div>
          <div className="form w-100">
            <form onSubmit={ (e) => { e.preventDefault(); return false }}>
              <div className="row">
                <div className="col-12 col-lg-6">
                  <Input label="First name" name="firstname" className="in-row" />
                </div>
                <div className="col-12 col-lg-6">
                  <Input label="Last name" name="lastname" className="in-row" />
                </div>
              </div>
              <Input label="Company name" name="company" />
              <Input label="Email address" type="email" name="email" />
              <Input label="Password" type="password" name="password" />
              <Checkbox name="terms" showSwitch={false} label="I agree to the <a href='https://fitlinkapp.com/terms-and-conditions' target='_blank' rel='noopener noreferrer'>Fitlink terms and conditions</a>" />
              <Checkbox name="newsletter" showSwitch={false} label="Subscribe to our Newsletter" />
              <div className="text-right">
                <Button label="Start trial" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </Signup>
  )
}

export default SignupPage