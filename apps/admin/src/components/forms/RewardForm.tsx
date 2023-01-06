import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import Input from '../elements/Input'
import Reward from '../elements/Reward'
import DateInput from '../elements/DateInput'
import { addYears } from 'date-fns'
import IconImage from '../icons/IconImage'
import { Reward as RewardEntity } from '@fitlink/api/src/modules/rewards/entities/reward.entity'
import { CreateRewardDto } from '@fitlink/api/src/modules/rewards/dto/create-reward.dto'
import useFormMutations from '../../hooks/api/useFormMutations'
import { AuthContext } from '../../context/Auth.context'
import Checkbox from '../elements/Checkbox'
import Feedback from '../elements/Feedback'
import { RewardRedeemType } from '@fitlink/api/src/modules/rewards/rewards.constants'

export type RewardFormProps = {
    current?: Partial<RewardEntity>
    onSave?: () => void
    onError?: (err: any) => void
    onDelete?: (fields: Partial<RewardEntity>) => void
}

const getFields = (reward: Partial<RewardEntity>) => {
    return {
        id: reward.id,
        name: reward.name,
        image: reward.image || {},
        description: reward.description,
        name_short: reward.name_short,
        reward_expires_at: reward.reward_expires_at || new Date(),
        code: reward.code,
        redeem_url: reward.redeem_url,
        redeem_instructions: reward.redeem_instructions,
        platform: reward.platform,
        brand: reward.brand,
        limit_units: reward.limit_units,
        units_available: reward.units_available,
        redeem_type: reward.redeem_type,
        points_required: reward.points_required,
        bfit_required: reward.bfit_required,
        image_upload: undefined
    }
}

const noop = () => null

export default function RewardForm({
    current,
    onSave = noop,
    onError = noop,
    onDelete = noop
}: RewardFormProps) {
    const { api, modeRole, primary } = useContext(AuthContext)
    const [image, setImage] = useState(current?.image?.url || '')
    const isUpdate = !!current.id

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: getFields(current)
    })

    const { errors, createOrUpdate, uploadReplaceOrKeep } = useFormMutations<
        CreateRewardDto,
        RewardEntity
    >({
        type: 'Reward',
        isUpdate,
        create: (payload) => {
            return api.post<RewardEntity>(
                '/rewards',
                {
                    payload
                },
                {
                    primary,
                    useRole: modeRole
                }
            )
        },
        update: (payload) =>
            api.put<RewardEntity>(
                `/rewards/:rewardId`,
                {
                    payload,
                    rewardId: current.id
                },
                {
                    primary,
                    useRole: modeRole
                }
            )
    })

    const brand = watch('brand')
    const shortTitle = watch('name_short')
    const redeem_type = watch('redeem_type')
    const points_required = watch('points_required')
    const bfit_required = watch('bfit_required')
    const expires = watch('reward_expires_at')
    const redeemed = current.redeemed_count || 0
    const title = watch('name')
    const description = watch('description')
    const instructions = watch('redeem_instructions')
    const code = watch('code')
    const limitUnits = watch('limit_units')

    async function onSubmit(
        data: CreateRewardDto & {
            image_upload: File
        }
    ) {
        const { image_upload, ...payload } = data

        try {
            // Handle images upload
            payload.imageId = await uploadReplaceOrKeep(
                image_upload,
                current.image ? current.image.id : undefined
            )

            // Force integers
            payload.points_required = parseInt(data.points_required as any)
            payload.bfit_required = parseInt(data.bfit_required as any)
            if (payload.limit_units) {
                payload.units_available = parseInt(data.units_available as any)
            } else {
                payload.units_available = 0
            }

            await createOrUpdate(payload)

            onSave()
        } catch (e) {
            console.log(e)
            onError(e)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h4 className="light mb-3">
                {current.id ? 'Edit reward' : 'New reward'}
            </h4>
            <Reward
                image={image}
                brand={brand}
                shortTitle={shortTitle}
                points={
                    redeem_type === RewardRedeemType.BFIT
                        ? bfit_required
                        : points_required
                }
                redeemType={redeem_type}
                expires={expires}
                redeemed={redeemed}
                title={title}
                description={description}
                code={code}
                instructions={instructions}
                showExtra={true}
            />

            <div className="basic-file-select">
                <input
                    type="file"
                    id="image"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setImage(URL.createObjectURL(event.target.files[0]))
                        setValue('image_upload', event.target.files[0])
                    }}
                    accept="image/*"
                />
                <IconImage />
                <label htmlFor="image">Select an image</label>
            </div>
            <div>
                {errors.imageId && (
                    <Feedback type="error" message="An image must be provided" />
                )}
            </div>

            {modeRole === 'app' && (
                <div className="radio-toggles">
                    <label>
                        <input
                            type="radio"
                            value={RewardRedeemType.Points}
                            {...register('redeem_type')}
                        />
                        Points
                    </label>

                    <label>
                        <input
                            type="radio"
                            value={RewardRedeemType.BFIT}
                            {...register('redeem_type')}
                        />
                        BFIT
                    </label>
                </div>
            )}

            {modeRole === 'app' && redeem_type === RewardRedeemType.BFIT ? (
                <>
                    <Input
                        name="bfit_required"
                        placeholder="0"
                        label="BFIT required"
                        type="number"
                        register={register('bfit_required')}
                        error={errors.bfit_required}
                    />
                </>
            ) : (
                <Input
                    name="points_required"
                    placeholder="0"
                    label="Points required"
                    type="number"
                    pattern="[0-9]+"
                    register={register('points_required')}
                    error={errors.points_required}
                />
            )}

            <Input
                name="brand"
                placeholder="Brand name"
                label="Brand name"
                value={brand}
                register={register('brand')}
                error={errors.brand}
            />
            <Input
                name="shortTitle"
                placeholder="Short title"
                label="Title (on thumbnail)"
                value={shortTitle}
                register={register('name_short')}
                error={errors.name_short}
            />
            <Input
                name="title"
                placeholder="Full title"
                label="Full title (in details page)"
                value={title}
                register={register('name')}
                error={errors.name}
            />
            <Input
                name="description"
                placeholder="Description"
                label="Long description"
                type="textarea"
                register={register('description')}
                error={errors.description}
            />
            <Input
                name="code"
                placeholder="Code"
                label="Redemption code"
                register={register('code')}
                error={errors.code}
            />
            <Input
                name="redeem_instructions"
                placeholder="How to redeem"
                label="Redemption instructions"
                value={instructions}
                type="textarea"
                rows={3}
                register={register('redeem_instructions')}
                error={errors.redeem_instructions}
            />
            <Input
                name="redeem_url"
                placeholder="URL"
                label="Redemption URL"
                register={register('redeem_url')}
                error={errors.redeem_url}
            />
            <DateInput
                label="Expiry date"
                name="expires"
                startDate={expires ? new Date(expires) : new Date()}
                onChange={(v) => {
                    setValue('reward_expires_at', v)
                }}
                minDate={new Date()}
                maxDate={addYears(new Date(), 10)}
                error={errors.reward_expires_at}
            />

            <Checkbox
                label="Limit units"
                name="limit_units"
                register={register('limit_units')}
                error={errors.limit_units}
            />

            {limitUnits && (
                <Input
                    name="units_available"
                    placeholder="0"
                    label="Units available"
                    type="number"
                    register={register('units_available')}
                    error={errors.units_available}
                />
            )}

            <div>
                {errors.imageId && (
                    <Feedback
                        type="error"
                        message="An image must be provided"
                        className="mt-2"
                    />
                )}
            </div>

            <div className="text-right mt-2">
                {current.id && (
                    <button
                        className="button alt mr-2"
                        type="button"
                        onClick={() => {
                            onDelete(current)
                        }}>
                        Delete
                    </button>
                )}

                <button className="button" type="submit">
                    {current.id ? 'Update' : 'Create reward'}
                </button>
            </div>
        </form>
    )
}
