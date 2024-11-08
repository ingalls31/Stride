import { yupResolver } from '@hookform/resolvers/yup'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useForm, Controller, FormProvider } from 'react-hook-form'
import { useMutation, useQuery } from 'react-query'
import userApi from '~/apis/userApi'
import Button from '~/components/Button'
import Input from '~/components/Input'
import InputNumber from '~/components/InputNumber'
import { UserSchema, userSchema } from '~/utils/rulesForm'
import DateSelect from '../../Components/DateSelect'
import { setProfileToLS } from '~/utils/auth'
import { AppContext } from '~/Contexts/app.context'
import { toast } from 'react-toastify'
import { getAvatarUrl, isAxiosErrorUnprocessableEntity } from '~/utils/utils'
import { errorResponse } from '~/types/utils.type'
import InputFile from '~/components/InputFile'
import useScrollTop from '~/hooks/useScrollTop'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

type FormData = Pick<
  UserSchema,
  'first_name' | 'last_name' | 'address' | 'phone_number' | 'date_of_birth' | 'avatar' | 'is_superuser'
>
type FormDataError = Omit<FormData, 'date_of_birth'> & {
  date_of_birth?: string
}
const profileSchema = userSchema.pick([
  'first_name',
  'last_name',
  'address',
  'phone_number',
  'date_of_birth',
  'avatar'
])

export default function Profile() {
  const { t } = useTranslation('profile')
  useScrollTop()
  const [fileImg, setFileImg] = useState<File>()
  const { setProfile } = useContext(AppContext)
  const methods = useForm<FormData>({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      address: '',
      date_of_birth: new Date(1990, 0, 1),
      avatar: ''
    },
    resolver: yupResolver(profileSchema)
  })

  const { data: profileData, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: userApi.getProfile
  })

  const profile = profileData?.data.results[0]

  const updateProfileMutation = useMutation({
    mutationFn: userApi.updateProfile
  })

  const updateAvatarProfileMutation = useMutation({
    mutationFn: userApi.updateAvatarProfile
  })

  const previewAvatar = useMemo(() => {
    return fileImg ? URL.createObjectURL(fileImg) : ''
  }, [fileImg])

  useEffect(() => {
    if (profile) {
      console.log('profile', profile);
      setProfile(profile)
      methods.setValue('first_name', profile.first_name)
      methods.setValue('last_name', profile.last_name)
      methods.setValue('phone_number', profile.phone_number)
      methods.setValue('address', profile.address)
      methods.setValue('is_superuser', profile.is_superuser)
      methods.setValue(
        'date_of_birth',
        profile.date_of_birth ? new Date(profile.date_of_birth) : new Date(1990, 0, 1)
      )
    }
  }, [profile, methods])

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      let avatarID = profile?.avatar
      if (fileImg) {
        const form = new FormData()
        form.append('image', fileImg)
        const uploadRes = await updateAvatarProfileMutation.mutateAsync(form)
        avatarID = uploadRes.data.id
        methods.setValue('avatar', avatarID)
      }
      const res = await updateProfileMutation.mutateAsync({
        id: profile.id,
        ...data,
        date_of_birth: data.date_of_birth?.toISOString().slice(0, 10),
        avatar: avatarID
      })
      setProfile(res.data)
      setProfileToLS(res.data)
      refetch()
      toast.success(res.data.message, {
        autoClose: 2000,
        hideProgressBar: true,
        position: 'top-center'
      })
    } catch (error) {
      if (isAxiosErrorUnprocessableEntity<errorResponse<FormDataError>>(error)) {
        const formError = error.response?.data.data
        if (formError) {
          Object.keys(formError).forEach((key) => {
            methods.setError(key as keyof FormDataError, {
              message: String(formError[key as keyof FormDataError]),
              type: 'Server'
            })
          })
        }
      }
    }
  })

  const handleChangeInputFile = (file: File) => {
    setFileImg(file)
  }

  return (
    <>
      <Helmet>
        <title>{`${t('profile')} | Stride`}</title>
        <meta name='description' content='Page profile Stride' />
      </Helmet>
      <div className='rounded-sm bg-white px-[30px] py-[18px] shadow'>
        <div className='border-b border-b-gray-200 pb-[18px]'>
          <h1 className='text-lg font-medium'>{t('my profile')}</h1>
          <div className='text-sm'>{t('desc_profile')}</div>
        </div>
        <FormProvider {...methods}>
          <form
            onSubmit={onSubmit}
            className='flex flex-col-reverse pt-[30px] text-sm lg:flex-row'
            noValidate
          >
            <div className='flex-1 pr-0 sm:pr-[50px]'>
              <div className='flex items-center gap-5 pb-[40px]'>
                <span className='min-w-[20%] text-right text-gray-400'>Email</span>
                <span>{profile?.email}</span>
              </div>
              <div className='flex gap-5 pb-[20px]'>
                <label htmlFor='name' className='mt-2 min-w-[20%] text-right text-gray-400'>
                  {t('first_name')}
                </label>
                <Input
                  id='first_name'
                  classNameError='text-[#ff424f] min-h-[1.5rem] text-sm pt-1 pl-1'
                  className='flex-1'
                  classNameInput='w-full flex-1 border border-gray-200 p-[9px] shadow-inner outline-none focus:border-gray-400'
                  name='first_name'
                  register={methods.register}
                  errorMessage={methods.formState.errors.first_name?.message}
                />
              </div>
              <div className='flex gap-5 pb-[20px]'>
                <label htmlFor='name' className='mt-2 min-w-[20%] text-right text-gray-400'>
                  {t('last_name')}
                </label>
                <Input
                  id='last_name'
                  classNameError='text-[#ff424f] min-h-[1.5rem] text-sm pt-1 pl-1'
                  className='flex-1'
                  classNameInput='w-full flex-1 border border-gray-200 p-[9px] shadow-inner outline-none focus:border-gray-400'
                  name='last_name'
                  register={methods.register}
                  errorMessage={methods.formState.errors.last_name?.message}
                />
              </div>
              <div className='flex gap-5 pb-[20px]'>
                <label htmlFor='phone' className='mt-2 min-w-[20%] text-right text-gray-400'>
                  {t('phone')}
                </label>
                <Controller
                  name='phone_number'
                  control={methods.control}
                  render={({ field }) => (
                    <Input
                      id='phone_number'
                      classNameError='text-[#ff424f] min-h-[1.5rem] text-sm pt-1 pl-1'
                      className='flex-1'
                      classNameInput='w-full flex-1 border border-gray-200 p-[9px] shadow-inner outline-none focus:border-gray-400'
                      errorMessage={methods.formState.errors.phone_number?.message}
                      {...field}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className='flex gap-5 pb-[20px]'>
                <label htmlFor='address' className='mt-2 min-w-[20%] text-right text-gray-400'>
                  {t('address')}
                </label>
                <Input
                  id='address'
                  classNameError='text-[#ff424f] min-h-[1.5rem] text-sm pt-1 pl-1'
                  className='flex-1'
                  classNameInput='w-full flex-1 border border-gray-200 p-[9px] shadow-inner outline-none focus:border-gray-400'
                  name='address'
                  register={methods.register}
                  errorMessage={methods.formState.errors.address?.message}
                />
              </div>
              <Controller
                name='date_of_birth'
                control={methods.control}
                render={({ field }) => (
                  <DateSelect
                    errorMessage={methods.formState.errors.date_of_birth?.message}
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
              <div className='flex items-center gap-5 pb-[30px]'>
                <div className='hidden min-w-[20%] sm:block'></div>
                <Button
                  type='submit'
                  className='w-full rounded-sm bg-orange px-5 py-[10px] text-white hover:opacity-90 lg:w-auto'
                >
                  {t('save')}
                </Button>
              </div>
            </div>
            <div className='mb-3 flex h-fit w-full justify-center border-l-gray-200 lg:mb-0 lg:w-[280px] lg:border-l'>
              <div className='flex flex-col items-center'>
                <img
                  className='my-5 h-[100px] w-[100px] rounded-full object-cover'
                  src={previewAvatar || profile?.avatar_url}
                  alt='avatar'
                />
                <InputFile onChange={handleChangeInputFile} />
                <div className='mt-3 text-gray-400'>
                  <div>{t('file size')}</div>
                  <div>{t('file extension')}</div>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </>
  )
}
