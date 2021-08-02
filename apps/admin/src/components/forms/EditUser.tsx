import Input from '../elements/Input'
import { useForm } from 'react-hook-form'
import { UpdateUserDto, UpdateUserEmailDto } from '@fitlink/api/src/modules/users/dto/update-user.dto'

export type CreateUserProps = {
  current: Partial<UpdateUserDto> & Partial<UpdateUserEmailDto>
}

export default function EditUser({
  current
}: CreateUserProps) {
  const { register, handleSubmit } = useForm({
    defaultValues: current
      ? {
          name: current.name,
          email: current.email
        }
      : {}
  })

  function onSubmit(data) {
    console.log(JSON.stringify(data))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">
        Edit user
      </h4>

      <Input
        register={register('name')}
        name="name"
        placeholder="Name"
        label="Name"
      />
      <Input
        register={register('email')}
        name="email"
        placeholder="Email address"
        label="Email address"
        type="email"
      />
      

      <div className="text-right mt-2">
        <button className="button">
          Save User
        </button>
      </div>
    </form>
  )
}