import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Card from '../../components/Card';
import Button from '../../components/Button';
import BottomTabBar from '../../components/BottomTabBar';
import { formatPhoneNumber } from '../../utils/formatters';
import useBrokerStore from '../../stores/brokerStore';

export default function ClientList() {
  const navigate = useNavigate();
  const { clients, addClient, addClientsFromExcel, removeClient, fetchClientBuildings } = useBrokerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [clientBuildings, setClientBuildings] = useState({});
  
  // 엑셀 업로드 상태
  const [isUploading, setIsUploading] = useState(false);

  const filteredClients = clients.filter(client =>
    (client.landlordName || '').includes(searchTerm) ||
    (client.landlordPhone || '').replace(/-/g, '').includes(searchTerm)
  );

  // 클라이언트 펼치기 시 건물 정보 로드
  const handleExpand = async (clientId, landlordId) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
      return;
    }
    setExpandedClientId(clientId);

    if (landlordId && !clientBuildings[clientId]) {
      const buildings = await fetchClientBuildings(landlordId);
      setClientBuildings(prev => ({ ...prev, [clientId]: buildings }));
    }
  };

  // 엑셀 업로드 핸들러
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // SheetJS 동적 임포트 (라이브러리 미설치 시 폴백 처리)
      let rows = [];
      try {
        const XLSX = await import('xlsx');
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(firstSheet);
      } catch (xlsxError) {
        console.warn('SheetJS 미설치 - CSV 폴백 시도:', xlsxError);
        // SheetJS 미설치 시 CSV 텍스트 파싱 폴백
        const text = await file.text();
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
            rows.push(row);
          }
        }
      }

      if (rows.length === 0) {
        alert('파일에서 데이터를 읽을 수 없습니다.\n엑셀 파일의 첫 번째 행에 "이름", "연락처" 열이 있는지 확인해 주세요.');
        return;
      }

      const count = await addClientsFromExcel(rows);
      alert(`[업로드 완료]\n'${file.name}' 파일에서 ${count}명의 임대인 데이터가 등록되었습니다.`);

    } catch (error) {
      console.error('엑셀 업로드 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="page" style={{ background: '#f8fafc' }}>
      <TopBar title="임대인 장부" showBack onBack={() => navigate('/broker/home')} />
      <div className="page-content" style={{ padding: '24px', paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 헤더 영역 */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
              나의 VIP 고객들 🤝
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0, lineHeight: '1.5' }}>
              나를 전담 중개사로 등록한 임대인과<br/>그들이 보유한 매물 현황을 한눈에 관리하세요.
            </p>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-primary-600)', fontWeight: 'bold', background: 'var(--color-primary-50)', padding: '6px 12px', borderRadius: '16px' }}>
            총 {clients.length}명
          </div>
        </div>

        {/* 엑셀 불러오기 영역 */}
        <div style={{ marginBottom: '24px' }}>
          <input 
            type="file" 
            id="excel-upload" 
            accept=".xlsx, .xls, .csv" 
            style={{ display: 'none' }}
            onChange={handleExcelUpload}
          />
          <Button 
            variant="secondary" 
            fullWidth 
            style={{ padding: '16px', background: 'white', color: 'var(--color-primary-600)', border: '1px dashed var(--color-primary-300)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            onClick={() => document.getElementById('excel-upload').click()}
          >
            {isUploading ? '⏳ 엑셀 파일 분석 중...' : '📊 기존 관리 자료(엑셀) 불러오기'}
          </Button>
        </div>

        {/* 검색창 */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="임대인 이름 또는 연락처 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '16px', borderRadius: '12px',
              border: '1px solid var(--color-border)', fontSize: '16px',
              background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        {/* 리스트 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredClients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
              {clients.length === 0 
                ? '아직 등록된 임대인이 없습니다.\n엑셀 업로드 또는 임대인의 앱 등록을 통해 추가됩니다.'
                : '검색된 임대인이 없습니다.'
              }
            </div>
          ) : (
            filteredClients.map((client) => {
              const isExpanded = expandedClientId === client.id;
              const buildings = clientBuildings[client.id] || [];
              const totalUnits = buildings.reduce((sum, b) => sum + b.totalUnits, 0);
              const totalVacant = buildings.reduce((sum, b) => sum + b.vacantUnits, 0);

              return (
                <Card key={client.id} style={{ overflow: 'hidden' }}>
                  <div 
                    style={{ padding: '4px', cursor: 'pointer' }}
                    onClick={() => handleExpand(client.id, client.landlordId)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{client.landlordName}</span>
                          <span style={{ fontSize: '13px', color: 'white', background: client.landlordId ? 'var(--color-primary-600)' : 'var(--color-text-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                            {client.landlordId ? '앱 유저' : '엑셀 등록'}
                          </span>
                        </div>
                        <div style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>{formatPhoneNumber(client.landlordPhone)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>등록일: {(client.registeredAt || '').split('T')[0]}</div>
                        {client.landlordId && buildings.length > 0 && (
                          <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                            건물 {buildings.length}동 / 총 {totalUnits}호실
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <Button variant="secondary" style={{ flex: 1, padding: '10px' }}
                          onClick={() => window.location.href = `tel:${(client.landlordPhone || '').replace(/-/g, '')}`}>
                          📞 전화 걸기
                        </Button>
                        <Button variant="secondary" style={{ flex: 1, padding: '10px' }}
                          onClick={() => window.location.href = `sms:${(client.landlordPhone || '').replace(/-/g, '')}`}>
                          💬 문자 보내기
                        </Button>
                      </div>

                      {client.landlordId && buildings.length > 0 && (
                        <>
                          <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: 'var(--color-text-primary)' }}>보유 건물 및 공실 현황</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {buildings.map(b => (
                              <div key={b.id} style={{ background: 'var(--color-bg-secondary)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{b.name}</div>
                                  <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>{b.address}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  {b.vacantUnits > 0 ? (
                                    <span style={{ color: 'var(--color-danger-600)', fontWeight: 'bold', fontSize: '14px' }}>공실 {b.vacantUnits}실</span>
                                  ) : (
                                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>공실 없음</span>
                                  )}
                                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>총 {b.totalUnits}호실</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {!client.landlordId && (
                        <div style={{ padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '8px', fontSize: '14px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                          엑셀로 등록된 임대인입니다. 앱 가입 후 연동되면 건물 정보가 표시됩니다.
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div 
                    onClick={() => handleExpand(client.id, client.landlordId)}
                    style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: isExpanded ? '16px' : '12px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    {isExpanded ? '▲ 접기' : '▼ 상세보기'}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
      <BottomTabBar role="broker" />
    </div>
  );
}
