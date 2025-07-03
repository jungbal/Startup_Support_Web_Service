import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { getMemberInfo, updateMember, checkUserEmail } from '../../api/memberApi';

// 유효성 검증 스키마
const schema = yup.object({
  userName: yup.string().required('이름을 입력하세요'),
  userPhone: yup
    .string()
    .required('전화번호를 입력하세요')
    .matches(/^01[0-9]-[0-9]{4}-[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다'),
  userEmail: yup
    .string()
    .required('이메일을 입력하세요')
    .email('올바른 이메일 형식이 아닙니다'),
  userAddr: yup.string().required('주소를 입력하세요'),
});

function ProfileEdit() {
  const { loginMember, setLoginMember } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [emailCheckStatus, setEmailCheckStatus] = useState(null);
  const [checkedEmail, setCheckedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      userName: loginMember?.userName || '',
      userPhone: loginMember?.userPhone || '',
      userEmail: loginMember?.userEmail || '',
      userAddr: loginMember?.userAddr || '',
    },
  });

  const watchEmail = watch('userEmail');

  // 이메일이 변경되면 중복체크 상태 초기화
  useEffect(() => {
    if (watchEmail !== checkedEmail && watchEmail !== loginMember?.userEmail) {
      setEmailCheckStatus(null);
      if (errors.userEmail && errors.userEmail.message === '이미 사용중인 이메일입니다') {
        clearErrors('userEmail');
      }
    }
  }, [watchEmail, checkedEmail, loginMember?.userEmail, errors.userEmail, clearErrors]);

  // 이메일 중복 체크
  function handleCheckUserEmail() {
    if (!watchEmail) {
      toast.error('이메일을 입력해주세요');
      return;
    }

    // 현재 사용자의 이메일과 같으면 중복체크 안함
    if (watchEmail === loginMember?.userEmail) {
      toast.info('현재 사용중인 이메일입니다');
      return;
    }

    clearErrors('userEmail');
    setEmailCheckStatus('checking');
    
    checkUserEmail(watchEmail)
      .then(function(response) {
        // response.data.resData로 접근
        if (response.data && response.data.resData === 0) {
          setEmailCheckStatus('available');
          setCheckedEmail(watchEmail);
          toast.success('사용 가능한 이메일입니다');
        } else {
          setEmailCheckStatus('unavailable');
          setError('userEmail', { message: '이미 사용중인 이메일입니다' });
          toast.error('이미 사용중인 이메일입니다');
        }
      })
      .catch(function(error) {
        console.error('이메일 중복 체크 오류:', error);
        setEmailCheckStatus(null);
        toast.error('이메일 중복 체크 중 오류가 발생했습니다');
      });
  }

  // 사용자 정보 초기화 (authStore loginMember 데이터 사용)
  useEffect(() => {
    if (loginMember && loginMember.userName && loginMember.userPhone && loginMember.userEmail) {
      const formData = {
        userName: loginMember.userName,
        userPhone: loginMember.userPhone,
        userEmail: loginMember.userEmail,
        userAddr: loginMember.userAddr || '',
      };
      reset(formData);
      setInitialData(formData);
    }
  }, [loginMember, reset]);

  // 최신 사용자 정보 불러오기 (컴포넌트 마운트 시 한 번만 실행)
  useEffect(() => {
    // 컴포넌트 마운트 시 한 번만 최신 정보 가져오기
    if (loginMember?.userId) {
      fetchUserInfo();
    }
  }, [loginMember?.userId, reset]); // setLoginMember 제거하여 무한 루프 방지

  // 팀원들이 배운 방식: function 선언문 + .then/.catch
  function fetchUserInfo() {
    if (!loginMember?.userId) {
      return;
    }
    
    getMemberInfo(loginMember.userId)
      .then(function(response) {
        // 팀원들이 배운 방식: response.data에서 직접 확인
        if (response.data && response.data.alertIcon === 'success' && response.data.resData) {
          const userData = response.data.resData;
          
          const formData = {
            userName: userData.userName,
            userPhone: userData.userPhone,
            userEmail: userData.userEmail,
            userAddr: userData.userAddr,
          };
          reset(formData);
          setInitialData(formData);
          
          // authStore도 최신 정보로 업데이트
          setLoginMember({ ...loginMember, ...formData });
        }
      })
      .catch(function(error) {
        console.error('회원 정보를 불러오는데 실패했습니다.');
      });
  }

  function onSubmit(data) {
    // 이메일이 변경되었고 중복체크를 하지 않은 경우
    if (data.userEmail !== loginMember?.userEmail && 
        (emailCheckStatus !== 'available' || checkedEmail !== data.userEmail)) {
      toast.error('변경된 이메일의 중복 체크를 해주세요');
      return;
    }
    
    setLoading(true);
    
    const updateData = {
      userId: loginMember.userId,
      ...data,
    };

    updateMember(updateData)
      .then(function(response) {
        if (response.data && response.data.alertIcon === 'success') {
          toast.success('정보가 수정되었습니다.');
          setInitialData(data);
          
          // authStore의 사용자 정보 업데이트
          setLoginMember({
            ...loginMember,
            userName: data.userName,
            userPhone: data.userPhone,
            userEmail: data.userEmail,
            userAddr: data.userAddr,
          });
        } else {
          toast.error(response.data?.clientMsg || '수정에 실패했습니다.');
        }
      })
      .catch(function(error) {
        console.error('수정 중 오류 발생:', error);
        toast.error('수정 중 오류가 발생했습니다.');
      })
      .finally(function() {
        setLoading(false);
      });
  }

  function handleReset() {
    if (initialData) {
      reset(initialData);
    }
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        기본 정보 수정
      </Typography>
      
      <form onSubmit={handleSubmit(onSubmit)} className="mypage-form">
        <TextField
          {...register('userName')}
          label="이름"
          fullWidth
          error={!!errors.userName}
          helperText={errors.userName?.message}
          disabled={loading}
        />

        <TextField
          {...register('userPhone')}
          label="전화번호"
          fullWidth
          placeholder="010-0000-0000"
          error={!!errors.userPhone}
          helperText={errors.userPhone?.message}
          disabled={loading}
        />

        <Box sx={{ position: 'relative' }}>
          <TextField
            {...register('userEmail')}
            label="이메일"
            fullWidth
            type="email"
            error={!!errors.userEmail}
            helperText={errors.userEmail?.message}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {emailCheckStatus === 'checking' && <CircularProgress size={20} />}
                  {emailCheckStatus === 'available' && <CheckCircle color="success" />}
                  {emailCheckStatus === 'unavailable' && <Cancel color="error" />}
                  {watchEmail && watchEmail !== loginMember?.userEmail && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCheckUserEmail}
                      disabled={loading || emailCheckStatus === 'checking'}
                    >
                      중복확인
                    </Button>
                  )}
                </Box>
              ),
            }}
          />
        </Box>

        <TextField
          {...register('userAddr')}
          label="주소"
          fullWidth
          error={!!errors.userAddr}
          helperText={errors.userAddr?.message}
          disabled={loading}
        />

        <Box className="mypage-button-group">
          <Button
            type="button"
            variant="outlined"
            onClick={handleReset}
            disabled={loading}
          >
            초기화
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            수정하기
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ProfileEdit; 