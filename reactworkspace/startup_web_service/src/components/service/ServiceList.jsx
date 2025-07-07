import React from 'react';
import { fetchServiceList } from '../../api/subsidyApi';

class ServiceList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      services: [],
      loading: true,
      error: null,
    };

    // 메서드 바인딩 (constructor에서 명시적으로 바인딩)
    this.loadServices = this.loadServices.bind(this);
    this.renderServiceItem = this.renderServiceItem.bind(this);
  }

  componentDidMount() {
    this.loadServices();
  }

  loadServices() {
    fetchServiceList(1, 10)
      .then(function (data) {
        // .then 내부에서 'this'가 ServiceList 인스턴스를 가리키도록 bind(this) 사용
        this.setState({
          services: data,
          loading: false,
        });
      }.bind(this)) // bind(this)로 'this' 컨텍스트 유지
      .catch(function (error) {
        console.error('서비스 목록 가져오기 실패:', error);
        // .catch 내부에서도 'this' 컨텍스트 유지
        this.setState({
          error: '데이터를 불러오는 중 오류가 발생했습니다.',
          loading: false,
        });
      }.bind(this)); // bind(this)로 'this' 컨텍스트 유지
  }

  renderServiceItem(item) {
    // JSX 문법 사용 (React.createElement 대신)
    return (
      <li key={item.servId} style={{ marginBottom: '20px' }}>
        <h3>{item.servNm}</h3>
        <p>{item.servDgst}</p>
      </li>
    );
  }

  render() {
    if (this.state.loading) {
      return <p>로딩 중입니다...</p>;
    }

    if (this.state.error) {
      return <p style={{ color: 'red' }}>{this.state.error}</p>;
    }

    // map 함수를 사용하여 서비스 목록 렌더링
    return (
      <div>
        <h2>공공서비스 목록</h2>
        <ul>
          {this.state.services.map(this.renderServiceItem)}
        </ul>
      </div>
    );
  }
}

export default ServiceList;