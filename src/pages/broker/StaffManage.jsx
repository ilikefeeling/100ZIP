import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { formatPhoneNumber } from '../../utils/formatters';
import useBrokerStore from '../../stores/brokerStore';

export default function StaffManage() {
  const navigate = useNavigate();
  const { staff, addStaff, removeStaff } = useBrokerStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 새 직원 폼 상태
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('중개보조원');

  const handleAddStaff = async () => {
    if (!newName || !newPhone) {
      alert('이름과 연락처를 모두 입력해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addStaff(newName, newPhone, newRole);
      setIsAddModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewRole('중개보조원');
      alert(`${newName}님이 직원으로 등록되었습니다.`);
    } catch (error) {
      console.error('직원 등록 오류:', error);
      alert('직원 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStaff = async (staffId, staffName) => {
    if (window.confirm(`${staffName} 직원을 목록에서 삭제(비활성화) 하시겠습니까?`)) {
      try {
        await removeStaff(staffId);
      } catch (error) {
        console.error('직원 삭제 오류:', error);
        alert('직원 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      <TopBar title="소속 직원 관리" showBack onBack={() => navigate('/broker/home')} />
      <div className="page-content" style={{ padding: '24px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
              우리 사무소 직원 👥
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5' }}>
              직원을 등록하여 임대인 장부와<br/>매물 정보를 함께 관리하세요.
            </p>
          </div>
          <Button 
            variant="primary" 
            style={{ padding: '8px 16px', borderRadius: '20px' }}
            onClick={() => setIsAddModalOpen(true)}
          >
            + 직원 등록
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {staff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
              등록된 직원이 없습니다.
            </div>
          ) : (
            staff.map(s => (
              <Card key={s.id} style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', background: 'var(--color-primary-50)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '20px' }}>
                      👤
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{s.name}</span>
                        <span style={{ fontSize: '13px', color: 'white', background: 'var(--color-text-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                          {s.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
                        {formatPhoneNumber(s.phone)}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleRemoveStaff(s.id, s.name)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', fontSize: '14px', cursor: 'pointer', padding: '8px' }}
                  >
                    삭제
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* 직원 등록 모달 */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>신규 직원 등록</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>이름</label>
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="홍길동"
                style={{ width: '100%', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>연락처</label>
              <input type="tel" value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="010-0000-0000"
                style={{ width: '100%', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '16px' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>직책/역할</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '16px', background: 'white' }}>
                <option value="중개보조원">중개보조원</option>
                <option value="소속공인중개사">소속공인중개사</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" fullWidth onClick={() => setIsAddModalOpen(false)}>취소</Button>
              <Button variant="primary" fullWidth onClick={handleAddStaff} disabled={isSubmitting}>
                {isSubmitting ? '등록 중...' : '등록하기'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
